import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ThreadService } from './thread.service';

export interface ExecuteCommandResponse {
  message: "Command executed";
  threadId:string;
  command:string;
}

@Injectable({
  providedIn: 'root'
})
export class CommandService {

  constructor(private http: HttpClient, private threadService:ThreadService) { }

  executeCommand(command: string, threadId?:string): Observable<any> {
    return this.http.post<ExecuteCommandResponse>('http://localhost:3000/command', { command, threadId }).pipe(tap(response=>{
      this.threadService.updateThread(response.threadId, command);
    }));
  }
}
