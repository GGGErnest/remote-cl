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