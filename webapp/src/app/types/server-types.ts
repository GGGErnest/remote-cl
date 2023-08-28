export interface Server {
    name: string;
    connectionSettings?: {
        host:string;
        port:number;
        username:string;
        password:string;
    };
    description: string;
    runningShells: {[key:string]:string};
}