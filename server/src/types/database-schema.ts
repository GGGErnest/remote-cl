import { Server } from "./server-types";

export interface DataBaseSchema {
    authentication: {
        privateKey:string;
        refreshTokenPrivateKey:string;
        refreshToken:string;
    },
    users: {
        admin: {
            username:string;
            password: string;
        }
    }
    servers: Server[];
}
