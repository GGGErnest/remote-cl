import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { WebSocketService } from './web-socket.service';
import { HistorySubject } from '../utils/history-subject';
import { WSOutMessage } from '../types/ws-types';
import { environment } from '../../environments/environment';
import { serializeMap, deserializeMap } from '../utils/serializers';


class ShellsHandler {
  private localStorageCommandsKey = 'outputHistory';
  private shellHistory = new Map<string, string[]>();

  constructor() {
    const commandsHistory = localStorage.getItem(this.localStorageCommandsKey);
    if(commandsHistory) {
      this.shellHistory = deserializeMap(commandsHistory);
    }
   }

   public addOutPut(threadID:string, item:string) {
    const commandHistory = this.shellHistory.get(threadID);
    if(commandHistory) {
      commandHistory.push(item);
      localStorage.setItem(this.localStorageCommandsKey, serializeMap(this.shellHistory));
      return;
    }

    this.shellHistory.set(threadID,[item]);
  }

  public addShell(threadID:string) {
    if(this.shellHistory.has(threadID)) {
      return;
    }

    this.shellHistory.set(threadID,[]);
  }

  public getOutputs(threadID:string): string[] | undefined {
    return this.shellHistory.get(threadID);
  }
  public getShellsID() : string[] | undefined {
    return Array.from(this.shellHistory.keys());
  }

  public hasShell(shellID: string) {
    return this.shellHistory.has(shellID);
  }

  public removeShell(shellID:string) {
    return this.shellHistory.delete(shellID);
  }
}

export interface ThreadResponse {
  message:string;
  result?:string[];
}

@Injectable({
  providedIn: 'root'
})
export class ThreadService {
  private apiUrl = environment.apiUrl;

  private shellsHandler = new ShellsHandler();
  private activeThreadOutput = new BehaviorSubject<string>(''); 
  private activeThread = new HistorySubject<string | undefined>(undefined);
  private threads = new BehaviorSubject<string[]>([]);

  public threads$ = this.threads.asObservable();
  public activeThread$ = this.activeThread.asObservable();
  public activeThreadOutput$ = this.activeThreadOutput.asObservable();


  constructor(private http: HttpClient,private webSocketService: WebSocketService) {
    this.webSocketService.messages.subscribe(message => {
      console.log("Out Message received");
      if(message.type === 'Output') {
        const outputMessage = message as WSOutMessage;
        const output = outputMessage.output?? outputMessage?.shellError ?? outputMessage.serverError;

        if(output){
        this.updateThread(outputMessage.threadId, output);
        }
      }
    });
   }

   private updateThreadsAsync() {
    this.threads.next(this.shellsHandler.getShellsID() ?? []);
   }

  public setActiveThread(threadID:string | undefined ) {
    if(!threadID) {
      this.activeThread.next(threadID);
      return;
    }

    if(this.shellsHandler.hasShell(threadID) && this.activeThread.value !== threadID) {
        this.activeThread.next(threadID);
    }
  }

  addThread(threadID:string) {
    this.shellsHandler.addShell(threadID);
    this.updateThreadsAsync();
  }

  public updateThread(threadID:string, command:string) {
    const isNewShell = !this.shellsHandler.hasShell(threadID);
     this.shellsHandler.addOutPut(threadID,command);
     if(isNewShell){
      this.updateThreadsAsync();
     }
     this.activeThreadOutput.next(command);
  }

  getOutputs(threadId:string):string[] {
    return Array.from(this.shellsHandler.getOutputs(threadId) ?? []);
  }

  getAllThreads(): Observable<any> {
    return this.http.get<ThreadResponse>(`${this.apiUrl}threads`).pipe(tap(response=> {
      if(response.result) {
        response.result.forEach((item)=> {this.shellsHandler.addShell(item)});
        this.updateThreadsAsync();
      }
    }));
  }

  deleteThread(threadID: string): Observable<any> {
    return this.http.delete<ThreadResponse>(`${this.apiUrl}thread/${threadID}`).pipe(tap(data=> {
        if (data.result && data.result[0]) {
          const threadToDelete = data.result[0];
          this.shellsHandler.removeShell(data.result[0]);
          this.updateThreadsAsync();
          // in case we delete the active thread we should set as active the one that was active before
          if(this.activeThread.value === threadToDelete) {
            const activeThreadHistory = this.activeThread.getHistory();
            const previousActiveThread = activeThreadHistory[activeThreadHistory.length-2];
            this.setActiveThread(previousActiveThread);
          }
        }
    }));
  }

  deleteAllThreads(): Observable<any> {
    return this.http.delete(`${this.apiUrl}threads/all`);
  }
}
