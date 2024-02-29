import { Injectable } from '@angular/core';
import { WebSocketService } from '../../shared/data-access/web-socket.service';
import { TerminalConnection } from './terminal-connection';
import { WSTerminalConnection } from '../../shared/data-access/ws-terminal-connection';
import { StateService } from '../../shared/data-access/state.service';
import lodash from 'lodash';
import { AuthService } from '../../authentication/data-access/auth.service';
import { NotificationService } from '../../shared/data-access/notification.service';
import { Server } from '../../servers/data-access/server';

@Injectable({
  providedIn: 'root',
})
export class TerminalConnectionManagerService {
  private _terminalsConnection = new Map<string, TerminalConnection>();

  constructor(
    private readonly _wsService: WebSocketService,
    private readonly _stateService: StateService,
    private readonly _authService: AuthService,
    private readonly _notificaTionService: NotificationService
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
            this._notificaTionService,
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
