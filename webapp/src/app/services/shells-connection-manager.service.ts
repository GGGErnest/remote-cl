import { Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { TerminalConnection } from '../types/terminal-connection';
import { WSTerminalConnection } from '../logic/ws-terminal-connection';

@Injectable({
  providedIn: 'root'
})
export class TerminalConnectionManagerService {

  private _terminalsConnection = new Map<string, TerminalConnection>();

  constructor(private _wsService: WebSocketService) {
  }

  public init(terminalIds:string[]) {
    terminalIds.forEach((terminalId)=> {
      if(!this._terminalsConnection.has(terminalId)){
        this._terminalsConnection.set(terminalId, new WSTerminalConnection(terminalId, this._wsService))
      }
    })
  }

  public getConnection(terminalId:string) :TerminalConnection | undefined {
    return this._terminalsConnection.get(terminalId);
  }
}
