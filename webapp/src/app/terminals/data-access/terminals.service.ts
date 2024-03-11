import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { Server } from 'src/app/servers/data-access/server-types';
import { environment } from '../../../environments/environment';
import {
  CreateTerminalResponse,
  TerminalHistoryResponse,
  TerminalResponse,
} from './api-types';

export type TerminalMessage = { result: string; message: string } | undefined;

@Injectable({
  providedIn: 'root',
})
export class TerminalsService {
  private apiUrl = environment.apiUrl + 'terminals/';
  private http = inject(HttpClient);

  public async getTerminalHistory(shellId: string) {
    return firstValueFrom(
      this.http.get<TerminalHistoryResponse>(this.apiUrl + shellId + '/history')
    );
  }

  getAllTerminals(): Observable<any> {
    return this.http.get<TerminalResponse>(this.apiUrl);
  }

  public async stopTerminal(server: Server, terminalId: string) {
    const terminalUuid = server.runningShells[terminalId];
    return firstValueFrom(
      this.http.delete<TerminalResponse>(`${this.apiUrl}${terminalUuid}`)
    );
  }

  stopAllTerminals(serverName: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}shells/all/` + serverName);
  }

  public async create(serverName: string, terminalId: string) {
    return firstValueFrom(
      this.http.post<CreateTerminalResponse>(this.apiUrl, {
        server: serverName,
        terminalId,
      })
    );
  }
}
