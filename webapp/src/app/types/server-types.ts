export interface Server {
    name: string;
    connectionSettings?: {
        host:string;
        port:number;
        username:string;
        password:string;
        privateKey:string;
        usePkey:boolean;
    };
    description: string;
    runningShells: {[key:string]:string};
}