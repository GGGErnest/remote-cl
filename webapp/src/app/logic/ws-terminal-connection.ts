import {
  BehaviorSubject,
  Observable,
  filter,
  takeUntil,
  takeWhile,
  tap,
} from 'rxjs';
import { TerminalConnection } from '../types/terminal-connection';
import { WSInputMessage, WSMessage, WSOutMessage, WSTerminalResizeMessage } from '../types/ws-types';
import { WebSocketService } from '../services/web-socket.service';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export class WSTerminalConnection implements TerminalConnection {
  private _output = new BehaviorSubject<string | undefined>(undefined);

  output = this._output.asObservable();

  constructor(private _terminalId: string,
     private _wss: WebSocketService,private readonly _authService: AuthService,
     private readonly _notificationService: NotificationService,
      private _onDestroyCompleted?:(terminalId:string)=> void) {
    this._wss.messages.pipe(
      takeWhile(() => _wss.state === 'Connected'),
      filter((wsMessage) => wsMessage.terminalId === this._terminalId),
      tap((wsMessage) => this._handleWSMessage(wsMessage))
    ).subscribe();
  }

  private _handleWSMessage(wsMessage: WSMessage) {
    const outputMessage = wsMessage as WSOutMessage;

    const errorMessage =
      outputMessage?.shellError ??
      outputMessage.serverError;

    if(errorMessage) {
      this._notificationService.showError(`Error in terminal ${outputMessage.terminalId} ${errorMessage}`)
      return;
    }

    if(outputMessage.output && outputMessage.output === 'Terminal Closed'){
            this.destroy();
            return;
    }
    
      this._output.next(outputMessage.output);
  }

  public input(input: string) {
    const message: WSInputMessage = {
      terminalId: this._terminalId,
      type: 'Input',
      message: input,
      accessToken: this._authService.getAuthToken(),
    };
    this._wss.sendMessage(message);
  }

  public resize(rows:number, cols:number, height: number, width: number) {
    const message: WSTerminalResizeMessage = {
      type:'TerminalResize',
      terminalId: this._terminalId,
      rows,
      cols,
      height,
      width
    }
    this._wss.sendMessage(message);
  }

  public destroy(): void {
    this._output.complete();
    if(this._onDestroyCompleted){
      this._onDestroyCompleted(this._terminalId);
    }
  }
}
