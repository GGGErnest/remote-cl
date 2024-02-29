import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  WSAuthErrorMessage,
  WSInputMessage,
  WSMessage,
  WSState,
} from './ws-types';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../authentication/data-access/auth.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private _state = new BehaviorSubject<WSState>('Disconnected');
  private _socket?: WebSocket;
  private _messageReceived = new Subject<WSMessage>();

  public messages = this._messageReceived.asObservable();
  state$ = this._state.asObservable();

  constructor(
    private readonly _authService: AuthService,
    private _notificationService: NotificationService
  ) {}

  public get state(): WSState {
    return this._state.value;
  }

  connect(): void {
    if (!this._socket || this._socket.readyState !== this._socket.OPEN) {
      this._state.next('Connecting');
      this._socket = new WebSocket(environment.wsHost);
      this._socket.addEventListener('open', () => {
        this._state.next('Connected');
      });

      this._socket.addEventListener('message', (event) =>
        this._handleMessage(event)
      );

      this._socket.addEventListener('error', (error) => {
        this._notificationService.showError(
          'WebSocket Error. Please contact the administrator for more info on how to fix it.'
        );
      });

      this._socket.addEventListener('close', () => {
        this._socket = undefined;
        this._state.next('Disconnected');
      });
    }
  }

  private _handleMessage(event: MessageEvent<any>): void {
    let message: WSMessage;

    // in case the data sent can't be parsed
    try {
      message = JSON.parse(event.data);

      // handling authentication errors although in theory it should not happen since the app wil keep
      // refreshing the token meanwhile is active
      if (
        message.type === 'AuthError' &&
        this._authService.isUserLoggedIn() &&
        (message as WSAuthErrorMessage).output === 'TokenExpired'
      ) {
        this._authService.logout();
      }

      this._messageReceived.next(message);
    } catch (error) {
      console.log('Message could not be parsed', event.data);
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
