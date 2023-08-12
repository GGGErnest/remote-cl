import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ThreadService } from './thread.service';
import { environment } from '../../environments/environment';

export interface ExecuteCommandResponse {
  message: "Command executed";
  threadId:string;
  command:string;
}

@Injectable({
  providedIn: 'root'
})
export class CommandService {
  private apiUrl = environment.apiUrl+'command'

  constructor(private http: HttpClient, private threadService:ThreadService) { }

  executeCommand(command: string, threadId:string): Observable<ExecuteCommandResponse> {
    return this.http.post<ExecuteCommandResponse>(this.apiUrl, { command, threadId });
  }
}
