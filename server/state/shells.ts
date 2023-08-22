import { ChildProcessWithoutNullStreams } from "child_process";
import { SSHShell } from "../logic/ssh-shell.js";

export class ShellsStorage {
    private shells: Record<string, SSHShell> = {}; 

    constructor() {

    }

    public add(shellId: string, shell: SSHShell) {
        this.shells[shellId]= shell;
    }

    public get(id:string): SSHShell | undefined {
       // returns the ssh client primarily if exist if not then returns the normal shell
        return this.shells[id];
    }

    public remove(id:string) {
        const shell = this.shells[id];
        shell.destroy();
        delete this.shells[id];
    }

    public length(): number {
        return Object.keys(shellsStorage).length;
    }

    public getIds() {
        return Object.keys(this.shells);
    }

    public getShells() {
        return Object.values(this.shells);
    }
}


export const shellsStorage = new ShellsStorage(); 
