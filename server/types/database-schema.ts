import { Server } from "./server-types";

export interface DataBaseSchema {
    password: string;
    servers: Server[];
}
