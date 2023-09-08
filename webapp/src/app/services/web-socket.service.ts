import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { WSInputMessage, WSMessage, WSState } from '../types/ws-types';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private _state = new BehaviorSubject<WSState>('Disconnected');
  private _socket?: WebSocket;
  private _messageReceived = new Subject<WSMessage>();

  public messages = this._messageReceived.asObservable();
  state$ = this._state.asObservable();

  public get state():WSState {
    return this._state.value;
  }

  connect(): void {
    if (!this._socket || this._socket.readyState !== this._socket.OPEN) {
      this._state.next('Connecting');
      this._socket = new WebSocket(environment.wsHost);
      this._socket.addEventListener('open',() => {
        console.log("WebSocket Connected");
        this._state.next('Connected');
     });
     this._socket.addEventListener('message', (event) => {
       
      console.log('Websocket Message', event);
      let message: any;

      // in case the data sent can't be parsed
      try {
        message = JSON.parse(event.data);
        this._messageReceived.next(message);
        console.log("WS -> Message Received: ", message);
      } catch (error){
        console.log('Message couldnt be parsed', event.data);
      }

    });
    this._socket.addEventListener('error',(error) => {
      console.error("WebSocket Error ", error);
    });
    this._socket.addEventListener('close', () => {
      this._socket = undefined;
      this._state.next('Disconnected');
    });
  }
}

public sendMessage(message: WSMessage) {
  this._socket?.send(JSON.stringify(message));
}

  disconnect(): void {
    if (this._socket) {
      this._socket.close();
    }
  }
}
