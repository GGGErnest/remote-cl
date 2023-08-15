import { ChildProcessWithoutNullStreams } from "child_process";
import { SSHShell } from "../logic/ssh-shell";

export class ShellsStorage {
    private shells: Record<string, SSHShell | ChildProcessWithoutNullStreams> = {}; 

    constructor(){

    }

    public add(shellId: string, shell: SSHShell | ChildProcessWithoutNullStreams){
        this.shells[shellId]= shell;
    }

    public get(id:string): ChildProcessWithoutNullStreams | SSHShell | undefined {
       // returns the ssh client primarily if exist if not then returns the normal shell
        return this.shells[id];
    }

    public remove(id:string) {
        const shell = this.shells[id];
        if(shell instanceof SSHShell){
            shell.destroy();
        } else {
            shell.kill();
        }
        delete this.shells[id];
    }

    public length(): number {
        return Object.keys(shells).length;
    }

    public getIds() {
        return Object.keys(this.shells);
    }

    public getShells() {
        return Object.values(this.shells);
    }
}


export const shells = new ShellsStorage(); 
