import {
  BehaviorSubject,
  Observable,
  filter,
  takeUntil,
  takeWhile,
  tap,
} from 'rxjs';
import { TerminalConnection } from '../types/terminal-connection';
import { WSInputMessage, WSMessage, WSOutMessage } from '../types/ws-types';
import { WebSocketService } from '../services/web-socket.service';

export class WSTerminalConnection implements TerminalConnection {
  private _output = new BehaviorSubject<string | undefined>(undefined);

  output = this._output.asObservable();

  constructor(private shellId: string, private wss: WebSocketService) {
    this.wss.messages.pipe(
      takeWhile(() => wss.state === 'Connected'),
      filter((wsMessage) => wsMessage.terminalId === this.shellId),
      tap((wsMessage) => this._handleWSMessage(wsMessage))
    ).subscribe();
  }

  private _handleWSMessage(wsMessage: WSMessage) {
    const outputMessage = wsMessage as WSOutMessage;
    const message =
      outputMessage.output ??
      outputMessage?.shellError ??
      outputMessage.serverError;

    if (message) {
        if(message === 'Terminal Closed'){
            this.destroy();
            return;
        }
      this._output.next(message);
    }
  }

  public input(input: string) {
    const message: WSInputMessage = {
      terminalId: this.shellId,
      type: 'Input',
      message: input,
    };
    this.wss.sendMessage(message);
  }

  public destroy(): void {
    this._output.complete();
  }
}
