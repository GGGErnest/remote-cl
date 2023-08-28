import { Client, ClientChannel, ConnectConfig, WriteStream } from "ssh2";
import { Shell } from "../types/shell-types.js";
import { WSOutputMessage, WSPromptMessage } from "../types/ws-types.js";
import { broadcast } from "../ws-server.js";
import { terminalsStorage } from "../state/shells.js";
import lodash from 'lodash';
import { deleteTerminal } from "../routes/terminals-routes.js";

interface ShellMessage {
  count:number;
  type: 'in' | 'out' | 'prompt';
  message:string;
}

class ShellMessagesHandler {
    private _messageCount = 0;
    private _messages: ShellMessage[] = [];
    
    constructor(private finishCallback:(answers:string[])=> void){

    }

    public hasUnansweredPrompts(): boolean {
        return this._messages[this._messageCount -1].type === 'prompt';
    }

    public addInMessage(message:string) {
      this._messages.push({count:this._messageCount,message,type: 'in'});
      this._messageCount+=1
    }

    public addPrompt(message : string) {
      this._messages.push({count:this._messageCount,message, type: 'prompt'});
      this._messageCount+=1;
    }

    public addOutMessage(message:string) {
      this._messages.push({count:this._messageCount,message,type: 'out'});
      this._messageCount+=1
    }

    public getMessages() {
      return this._messages;
    }

    // public addAnswer(answer:string) {
    //     this.answers.push(answer);
    //     this.unansweredPrompts.splice(1, this.unansweredPrompts.length-1);
    //     if(!this.hasUnansweredPrompts()) {
    //         this.finishCallback(Array.from(this.answers));
    //         this.unansweredPrompts = [];
    //         this.answers = [];
    //     }
    // }
}

export class SSHShell implements Shell {
  private connection = new Client();
  private shellWriteStream?: ClientChannel;
  private passwordRequired = false;
  private _messages = new ShellMessagesHandler((answers:string[])=> this.onAllPromptsAnswered(answers));
  private finishCallBack?: Function;

  constructor(
    private shellId: string,
    private connectionSettings: ConnectConfig
  ) {
    this.init();
  }

  public write(command: string) {
    if (this.shellWriteStream && this.shellWriteStream.writable) {
      console.log('Writing to terminal', command);
      this.shellWriteStream?.write(command);
    }
  }

  public getHistory() {
    return lodash.cloneDeep(this._messages);
  }

  public destroy() {
    this.shellWriteStream?.end();
    this.connection.destroy();
  }

  private onAllPromptsAnswered(answers:string[]) {
    if(this.finishCallBack){
        this.finishCallBack(answers);
    }
  }
  
  private registerListeners() {
    this.connection.on("ready", () => {
      console.log("SSH Client ready");
      
      this.passwordRequired = false;

      this.connection.shell((err, stream) => {
        this.shellWriteStream = stream;
        // error thrown by the ssh connection
        if (err) {
          const serverError = err.message;
          console.log(
            "Server error in shell " + this.shellId + " ",
            serverError
          );
          const message: WSOutputMessage = {
            type: "Output",
            terminalId: this.shellId,
            serverError,
          };
          broadcast(message);
          this._messages.addOutMessage(serverError);
        }

        stream.on("close", () => {
          const exitMessage = `Terminal Closed`;
          console.log(exitMessage);
          const message: WSOutputMessage = {
            type: "Output",
            terminalId: this.shellId,
            output: exitMessage,
          };
          broadcast(message);

          this.connection.end();
          
          deleteTerminal(this.shellId);
        });

        stream.on("data", (data: string) => {
          const output = data.toString();
          console.log("Data received from shell " + this.shellId + " ", output);
          const message: WSOutputMessage = {
            type: "Output",
            terminalId: this.shellId,
            output,
          };
          broadcast(message);
          this._messages.addOutMessage(output);
        });

        terminalsStorage.add(this.shellId, this);
      });
    });

    this.connection.on("error", (err) => {
      if (err.level === "client-authentication") {
        this.passwordRequired = true;
        console.log('Auth error', err);
        const output: WSOutputMessage = {
            type:'Output',
            terminalId: this.shellId,
            output: 'Please enter the password'
        } 
        broadcast(output);
      } else {
        console.error(`Error: ${err.message}`);
      }
    });
  }

  private init() {
    this.registerListeners();
    this.connection.connect(this.connectionSettings);
  }
}
