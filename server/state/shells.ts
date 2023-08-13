import { ChildProcessWithoutNullStreams } from "child_process";
import { Client } from 'ssh2';

export class ShellsStorage {
    private shells: Record<string, [ChildProcessWithoutNullStreams, Client | undefined]> = {}; 

    constructor(){

    }

    public get(id:string): ChildProcessWithoutNullStreams | Client | undefined {
       // returns the ssh client primarily if exist if not then returns the normal shell
        return shells[id] ? shells[id][1]?? shells[id][0] : undefined;
    }

    public remove(id:string, allShells:boolean) {
        if(allShells) {
            // stopping first the ssh client if exist
            this.shells[id][1]?.destroy();
            this.shells[id][0].kill();
            delete shells[id];
        }
    }
}

export function writeCommand(shell: ChildProcessWithoutNullStreams | Client, command: string) {
    if(shell instanceof Client) {
        shell.shell()
    }
}

export const shells = new ShellsStorage(); 
