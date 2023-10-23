import { Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { TerminalConnection } from '../types/terminal-connection';
import { WSTerminalConnection } from '../logic/ws-terminal-connection';
import { StateService } from './state.service';
import lodash from 'lodash';
import { Server } from '../types/server-types';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class TerminalConnectionManagerService {
  private _terminalsConnection = new Map<string, TerminalConnection>();

  constructor(
    private _wsService: WebSocketService,
    private _stateService: StateService,
    private _authService: AuthService,
  ) {}

  /**
   * Executed when a terminal receives the exit message from the server
   * @param terminalId 
   */
  private _onTerminalDestroy(terminalId: string) {
    const servers = this._stateService.servers;
    const serverToUpdate = lodash.find(
      servers,
      (server: Server) => !!server.runningShells[terminalId]
    );
    if (serverToUpdate) {
      delete serverToUpdate.runningShells[terminalId];
    }
    this.removeConnection(terminalId);
    this._stateService.updateServers(servers);
  }

  public init(terminalIds: string[]) {
    terminalIds.forEach((terminalId) => {
      if (!this._terminalsConnection.has(terminalId)) {
        this._terminalsConnection.set(
          terminalId,
          new WSTerminalConnection(
            terminalId,
            this._wsService,
            this._authService,
            this._onTerminalDestroy.bind(this)
          )
        );
      }
    });
  }

  public getConnection(terminalId: string): TerminalConnection | undefined {
    return this._terminalsConnection.get(terminalId);
  }

  public removeConnection(terminalId: string) {
    return this._terminalsConnection.delete(terminalId);
  }
}
