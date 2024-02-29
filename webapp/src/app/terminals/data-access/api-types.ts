import { BaseServerResponse } from "src/app/shared/data-access/api-types";

export interface TerminalResponse extends BaseServerResponse {

}

export interface TerminalHistoryResponse {
    result:string[];
}

export interface CreateTerminalResponse extends BaseServerResponse {
  result: { terminalId: string };
}
