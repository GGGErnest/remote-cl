import { Client, ClientChannel, ConnectConfig } from "ssh2";
import { Shell } from "../types/shell-types.js";
import { WSInputMessage, WSMessage, WSOutputMessage, WSTerminalResizeMessage } from "../types/ws-types.js";
import { broadcast } from "../ws-server.js";
import { terminalsStorage } from "../state/shells.js";
import lodash from 'lodash';
import { deleteTerminal } from "../routes/terminals-routes.js";

interface ShellMessage {
  count:number;
  type: 'in' | 'out' | 'prompt';
  message:string;
}

class TerminalMessagesHandler {
    private _messageCount = 0;
    private _messages: ShellMessage[] = [];
    
    constructor() {

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
}

export class SSHTerminal implements Shell {
  private connection = new Client();
  private shellWriteStream?: ClientChannel;
  private _messages = new TerminalMessagesHandler();

  constructor(
    private shellId: string,
    private connectionSettings: ConnectConfig
  ) {
    this.init();
  }

  public handleMessage(message: WSMessage) {
    // only one for now but will come more later
    switch(message.type){
      case 'Input':
        this.write((message as WSInputMessage).message);
        break;
    }
  }

  public write(command: string) {
    if (this.shellWriteStream?.writable) {
      this.shellWriteStream?.write(command);
    }
  }

  public getHistory() {
    return lodash.cloneDeep(this._messages);
  }

  public destroy() {
    this.shellWriteStream?.end('exit\r');
    this.connection.end();
    this.connection.destroy();
  }
  
  private registerListeners() {
    this.connection.on("ready", () => {
      console.log("SSH Client ready");
      
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

          deleteTerminal(this.shellId);
        });

        // listening for data coming from the terminal on the host
        stream.on("data", (data: string) => {
          const output = data.toString();
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
        const errorMessage: WSOutputMessage = {
          type:'Output',
          terminalId:this.shellId,
          shellError: 'Failed to authenticate into the Server',
        }
        broadcast(errorMessage);
      } else {
        const errorMessage: WSOutputMessage = {
          type:'Output',
          terminalId:this.shellId,
          shellError: err.message,
        }
        broadcast(errorMessage);
      }
    });
  }

  private init() {
    this.registerListeners();
    this.connection.connect(this.connectionSettings);
  }
}
