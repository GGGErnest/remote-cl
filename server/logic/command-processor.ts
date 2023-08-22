import { Command, SSHCommand } from "../types/command-types.js";

const sshRegex = new RegExp(/^ssh\s+((?:(\w+)@)?(?:(\w+):)?([\w\.-]+))(?:\s+-p\s+(\d+))?.*$/);

export class CommandProcessor {
    constructor(){

    }

    public process(command:string): Command {
        const splitCommand = command.trim().split(' ');
        const base = splitCommand[0];
        const args = splitCommand.slice(1);
        if(base === 'ssh') {
            const match = command.match(sshRegex);
            if(match) {
            const processedCommand: SSHCommand = {
                    rawCommand: command,
                    base,
                    args,
                    password: match[3],
                    user: match[2],
                    port: match[5] ? parseInt(match[5]) : 22,
                    server:match[4]
                };
            return processedCommand;
            }
        }

        return { rawCommand: command,base, args};
    }

}