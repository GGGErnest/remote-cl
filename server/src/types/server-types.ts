import { ConnectConfig } from "ssh2";

export interface Server {
    name: string;
    description: string;
    connectionSettings?: ConnectConfig;
    runningShells: {[key:string]:string};
}