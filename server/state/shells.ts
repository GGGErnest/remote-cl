import { ChildProcessWithoutNullStreams } from "child_process";
import { SSHTerminal } from "../logic/ssh-shell.js";

export class TerminalsStorage {
    private terminals: Record<string, SSHTerminal> = {}; 

    constructor() {

    }

    public add(shellId: string, shell: SSHTerminal) {
        this.terminals[shellId]= shell;
    }

    public get(id:string): SSHTerminal | undefined {
       // returns the ssh client primarily if exist if not then returns the normal shell
        return this.terminals[id];
    }

    public remove(id:string) {
        const terminal = this.terminals[id];
        terminal.destroy();
        delete this.terminals[id];
    }

    public length(): number {
        return Object.keys(terminalsStorage).length;
    }

    public getIds() {
        return Object.keys(this.terminals);
    }

    public getTerminals() {
        return Object.values(this.terminals);
    }
}


export const terminalsStorage = new TerminalsStorage(); 
