export interface Server {
    name: string;
    connectionSettings?: {
        host:string;
        port:number;
        username:string;
        password:string;
        pkey:string;
        usePKey:boolean;
    };
    description: string;
    runningShells: {[key:string]:string};
}