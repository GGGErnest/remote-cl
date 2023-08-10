import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { WebSocketService } from './web-socket.service';
import { HistorySubject } from '../utils/history-subject';
import { WSOutMessage } from '../types/ws-types';
import { environment } from '../../environments/environment';

function serializeMap<T,K>(map: Map<T,K>): string {
  return JSON.stringify([...map]);
}

function deserializeMap<T,K>(serializedMap: string): Map<T,K> {
  return new Map(JSON.parse(serializedMap));
}


class ShellsHandler {
  private localStorageCommandsKey = 'commandsHistory';
  private commandsHistory = new Map<string, string[]>();

  constructor() {
    const commandsHistory = localStorage.getItem(this.localStorageCommandsKey);
    if(commandsHistory) {
      this.commandsHistory = deserializeMap(commandsHistory);
    }
   }

   public addOutPut(threadID:string, item:string) {
    const commandHistory = this.commandsHistory.get(threadID);
    if(commandHistory) {
      commandHistory.push(item);
      localStorage.setItem(this.localStorageCommandsKey, serializeMap(this.commandsHistory));
      return;
    }

    this.commandsHistory.set(threadID,[]);
  }

  public addShell(threadID:string) {
    if(this.commandsHistory.has(threadID)) {
      return;
    }

    this.commandsHistory.set(threadID,[]);
  }

  public getOutputs(threadID:string): string[] | undefined {
    return this.commandsHistory.get(threadID);
  }
  public getShellsID() : string[] | undefined {
    return Array.from(this.commandsHistory.keys());
  }

  public hasShell(shellID: string) {
    return this.commandsHistory.has(shellID);
  }

  public removeShell(shellID:string) {
    return this.commandsHistory.delete(shellID);
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
  private activeThreadOutput = new BehaviorSubject<string | string[]>([]); 
  private activeThread = new HistorySubject<string>('');
  private threads = new BehaviorSubject<string[]>([]);

  public threads$ = this.threads.asObservable();
  public activeThread$ = this.activeThread.asObservable();
  public activeThreadOutput$ = this.activeThreadOutput.asObservable();


  constructor(private http: HttpClient,private webSocketService: WebSocketService) {
    this.webSocketService.messages.subscribe(message => {
      console.log("Out Message received");
      if(message.type === 'Output') {
        const outputMessage = message as WSOutMessage;
        if(outputMessage.output){
         this.updateThread(outputMessage.threadId, outputMessage.output);
        }
      }
    });
   }

   private updateThreadsAsync() {
    this.threads.next(this.shellsHandler.getShellsID() ?? []);
   }

  public setActiveThread(threadID:string) {
    if(this.shellsHandler.hasShell(threadID)) {
        this.activeThread.next(threadID);
        const shellOutputs = this.shellsHandler.getOutputs(this.activeThread.value) ?? [];
        this.activeThreadOutput.next(shellOutputs);
    }
  }

  addThread(threadID:string) {
    this.shellsHandler.addShell(threadID);
    this.updateThreadsAsync();
  }

  public updateThread(threadID:string, command:string) {
    if(this.shellsHandler.hasShell(threadID)) {
     this.shellsHandler.addOutPut(threadID,command);
     this.activeThreadOutput.next(command);
      return
    }

    this.shellsHandler.addShell(threadID);
  }

  getOutputs(threadId:string){
    return this.shellsHandler.getOutputs(threadId);
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
    return this.http.delete<ThreadResponse>(`${this.apiUrl}threads/${threadID}`).pipe(tap(data=> {
        if (data.result && data.result[0]) {
          const threadToDelete = data.result[0];
          this.shellsHandler.removeShell(data.result[0]);
          this.updateThreadsAsync();
          // in case we delete the active thread we should set as active the one that was active before
          if(this.activeThread.value === threadToDelete) {
            const activeThreadHistory =this.activeThread.getHistory();
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
