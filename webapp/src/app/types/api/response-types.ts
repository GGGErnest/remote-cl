import { Server } from '../server-types';

export interface BackendResponse {
  message: string;
  result: unknown;
}

export interface TerminalResponse extends BackendResponse {}

export interface CreateTerminalResponse extends BackendResponse {
  result: { terminalId: string };
}

export interface ServersResponse extends BackendResponse {
  result: Server[];
}
