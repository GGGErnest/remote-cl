export interface Command {
    rawCommand:string;
    base:string;
    args:string[];
}

export interface SSHCommand extends Command {
    base: 'ssh';
    port: number;
    server: string;
    user?: string;
    password?:string;
}

export function isSSHCommand(command: Command): command is SSHCommand {
    return 'port' in command;
}