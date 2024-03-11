import { ServerResponse } from 'src/app/shared/data-access/models/api-types';

export interface TerminalResponse extends ServerResponse {}

export interface TerminalHistoryResponse {
  result: string[];
}

export interface CreateTerminalResponse extends ServerResponse {
  result: { terminalId: string };
}
