import { Client, ClientChannel, ConnectConfig, WriteStream } from "ssh2";
import { Shell } from "../types/shell-types.js";
import { WSOutMessage, WSPromptMessage } from "../types/ws-types.js";
import { broadcast } from "../ws-server.js";
import { shellsStorage } from "../state/shells.js";

class PromptsHandler {
    private unansweredPrompts: string [] = [];
    private answers : string [] = [];
    
    constructor(private finishCallback:(answers:string[])=> void){

    }

    public hasUnansweredPrompts(): boolean {
        return this.unansweredPrompts.length> 0;
    }

    public addPrompt(prompt : string) {
        this.unansweredPrompts.push(prompt);
    }

    public addAnswer(answer:string){
        this.answers.push(answer);
        this.unansweredPrompts.splice(1, this.unansweredPrompts.length-1);
        if(!this.hasUnansweredPrompts()) {
            this.finishCallback(Array.from(this.answers));
            this.unansweredPrompts = [];
            this.answers = [];
        }
    }
}

export class SSHShell implements Shell {
  private connection = new Client();
  private shellWriteStream?: ClientChannel;
  private passwordRequired = false;
  private prompts = new PromptsHandler((answers:string[])=> this.onAllPromptsAnswered(answers));
  private finishCallBack?: Function;

  constructor(
    private shellId: string,
    private connectionSettings: ConnectConfig
  ) {
    this.init();
  }

  public write(command: string) {
    if(this.passwordRequired) {
        this.connectionSettings.password = command;
        console.log('New settings ', this.connectionSettings);
        this.connection.connect(this.connectionSettings);
        return;
    }

    // command is an answer
    if(this.prompts.hasUnansweredPrompts()) {
        this.prompts.addAnswer(command);
        return;
    }

    if (this.shellWriteStream && this.shellWriteStream.writable) {
      this.shellWriteStream?.write(command + "\n");
    }
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
          const message: WSOutMessage = {
            type: "Output",
            threadId: this.shellId,
            serverError,
          };
          broadcast(message);
        }

        stream.on("close", () => {
          const exitMessage = `The process exited`;
          console.log(exitMessage);
          const message: WSOutMessage = {
            type: "Output",
            threadId: this.shellId,
            output: exitMessage,
          };
          broadcast(message);

          this.connection.end();
          shellsStorage.remove(this.shellId);
        });

        stream.on("data", (data: string) => {
          const output = data.toString();
          console.log("Data received from shell " + this.shellId + " ", output);
          const message: WSOutMessage = {
            type: "Output",
            threadId: this.shellId,
            output,
          };
          broadcast(message);
        });

        shellsStorage.add(this.shellId, this);
      });
    });

    this.connection.on(
      "keyboard-interactive",
      (name, instructions, instructionsLang, prompts, finish) => {
        console.log(name);
        console.log(instructions);

        if (prompts.length > 0) {
            prompts.forEach((prompt)=> {
                this.prompts.addPrompt(prompt.prompt);
            })
        } else {
          finish([]);
        }
      }
    );

    this.connection.on("error", (err) => {
      if (err.level === "client-authentication") {
        this.passwordRequired = true;
        console.log('Auth error', err);
        const output: WSOutMessage = {
            type:'Output',
            threadId: this.shellId,
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
