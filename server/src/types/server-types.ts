import { ConnectConfig } from "ssh2";

export interface Server {
    name: string;
    description: string;
    connectionSettings?: ConnectConfig & {usePkey:boolean};
    runningShells: {[key:string]:string};
}