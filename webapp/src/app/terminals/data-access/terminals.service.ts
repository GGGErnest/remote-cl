import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import lodash from 'lodash';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TerminalConnectionManagerService } from './terminal-connection-manager.service';
import { StateService } from '../../shared/data-access/state.service';
import { CreateTerminalResponse, TerminalHistoryResponse, TerminalResponse } from './api-types';
import { Server } from 'src/app/servers/data-access/server';

export type TerminalMessage = { result: string; message: string } | undefined;

@Injectable({
  providedIn: 'root',
})
export class TerminalsService {
  private apiUrl = environment.apiUrl + 'terminals/';

  constructor(
    private http: HttpClient,
    private _termConnManagerService: TerminalConnectionManagerService,
    private _stateService: StateService
  ) {}

  public getTerminalHistory(shellId: string) {
    return this.http.get<TerminalHistoryResponse>(
      this.apiUrl + shellId + '/history'
    );
  }

  getAllTerminals(): Observable<any> {
    return this.http.get<TerminalResponse>(this.apiUrl);
  }

  stopTerminal(server: Server, terminalId: string): Observable<any> {
    const terminalUuid = server.runningShells[terminalId];
    return this.http
      .delete<TerminalResponse>(`${this.apiUrl}${terminalUuid}`)
      .pipe(tap({ next: () => {
        const servers = this._stateService.servers;
        const serverToUpdate = servers.find((item) => item.name === server.name);
        delete serverToUpdate?.runningShells[terminalId];
        this._stateService.updateServers(servers);
      } }));
  }

  stopAllTerminals(serverName: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}shells/all/` + serverName);
  }

  create(
    serverName: string,
    terminalId: string
  ): Observable<CreateTerminalResponse> {
    return this.http
      .post<CreateTerminalResponse>(this.apiUrl, {
        server: serverName,
        terminalId,
      })
      .pipe(
        tap((response) => {
          if (response.result) {
            const terminalId = Object.keys(response.result)[0];
            this._termConnManagerService.init([terminalId]);
            const servers = this._stateService.servers;
            const server = servers.find((server) => server.name === serverName);
            if (server) {
              lodash.assign(server.runningShells, response.result);
            }
            this._stateService.updateServers(servers);
          }
        })
      );
  }
}
