import { BaseServerResponse } from "src/app/shared/data-access/api-types";
import { Server } from "./server";

export interface ServersResponse extends BaseServerResponse {
    result: Server[];
  }
  