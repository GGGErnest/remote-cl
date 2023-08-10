import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { WSMessage } from '../types/ws-types';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private isConnected = new BehaviorSubject<boolean>(false);
  private socket?: WebSocket;
  private messageReceived = new Subject<WSMessage>();

  public messages = this.messageReceived.asObservable();
  isConnected$ = this.isConnected.asObservable();

  connect(): void {
    if (!this.socket || this.socket.readyState !== this.socket.OPEN) {
      this.socket = new WebSocket(environment.wsHost);
      this.socket.addEventListener('open',() => {
        console.log("WebSocket Connected");
        this.isConnected.next(true);
     });
     this.socket.addEventListener('message', (event) => {
       
      console.log('Websocket Message', event);
      let message: any;

      // in case the data sent can't be parsed
      try {
        message = JSON.parse(event.data);
        this.messageReceived.next(message);
        console.log("WS -> Message Received: ", message);
      } catch (error){
        console.log('Message couldnt be parsed', event.data);
      }

    });
    this.socket.addEventListener('error',(error) => {
      console.error("WebSocket Error ", error);
    });
    this.socket.addEventListener('close', () => {
      this.isConnected.next(false);
    });
  }
}

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = undefined;
    }
  }
}
