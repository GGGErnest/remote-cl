import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { WebSocketService } from './web-socket.service';
import { HistorySubject } from '../utils/history-subject';
import { WSOutMessage } from '../types/ws-types';
import { environment } from '../../environments/environment';
import { serializeMap, deserializeMap } from '../utils/serializers';

export interface ShellResponse {
  message:string;
  result?:string[];
}

export type ShellMessage = {shellId:string, message:string} | undefined;

@Injectable({
  providedIn: 'root'
})
export class ShellsService {
  private apiUrl = environment.apiUrl + 'shells/';

  private activeThreadOutput = new BehaviorSubject<string>(''); 
  private activeShell = new HistorySubject<string | undefined>(undefined);
  private shells = new BehaviorSubject<string[]>([]);

  // new stuff
  private _output = new BehaviorSubject<ShellMessage>(undefined);
  public output = this._output.asObservable();
  private _promptOutput = new HistorySubject<ShellMessage>(undefined);
  public promptOutput = this._promptOutput.asObservable();

  public threads$ = this.shells.asObservable();
  public activeThread$ = this.activeShell.asObservable();
  public activeThreadOutput$ = this.activeThreadOutput.asObservable();


  constructor(private http: HttpClient,private webSocketService: WebSocketService) {
    this.webSocketService.messages.subscribe(wsMessage => {
      console.log("Out Message received");
      if(wsMessage.type === 'Output') {
        const outputMessage = wsMessage as WSOutMessage;
        const message = outputMessage.output?? outputMessage?.shellError ?? outputMessage.serverError;

        if(message){
        this._output.next({shellId: outputMessage.shellId, message});
        }
      }

      //TODO: Finish the websocket message handling and add the shellId to messages sent by the WS
    });
   }

   public getShellHistory(shellId:string ) {
    return this.http.get(this.apiUrl+shellId+'history');
   }


  getAllShells(): Observable<any> {
    return this.http.get<ShellResponse>(this.apiUrl);
  }

  deleteThread(threadID: string): Observable<any> {
    return this.http.delete<ShellResponse>(`${this.apiUrl}thread/${threadID}`);
  }

  deleteAllThreads(serverName:string): Observable<any> {
    return this.http.delete(`${this.apiUrl}shells/all/`+serverName);
  }
}
