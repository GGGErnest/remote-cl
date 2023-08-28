import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { WebSocketService } from './web-socket.service';
import { HistorySubject } from '../utils/history-subject';
import { WSOutMessage } from '../types/ws-types';
import { environment } from '../../environments/environment';
import { serializeMap, deserializeMap } from '../utils/serializers';

export interface TerminalResponse {
  message: string;
  result?: string[];
}

export type ShellMessage = { shellId: string; message: string } | undefined;

@Injectable({
  providedIn: 'root',
})
export class ShellsService {
  private apiUrl = environment.apiUrl + 'terminals/';

  constructor(private http: HttpClient) {}

  public getShellHistory(shellId: string) {
    return this.http.get<TerminalResponse>(this.apiUrl + shellId + '/history');
  }

  getAllShells(): Observable<any> {
    return this.http.get<TerminalResponse>(this.apiUrl);
  }

  deleteThread(threadID: string): Observable<any> {
    return this.http.delete<TerminalResponse>(`${this.apiUrl}thread/${threadID}`);
  }

  deleteAllThreads(serverName: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}shells/all/` + serverName);
  }

  create(server: string): Observable<TerminalResponse> {
    return this.http.post<TerminalResponse>(this.apiUrl,{server});
  }
}
