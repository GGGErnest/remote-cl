import { Server } from "./server-types";

export interface DataBaseSchema {
    authentication: {
        secret:string;
        refreshAuthToken:string;
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
