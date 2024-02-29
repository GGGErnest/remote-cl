import {
  AfterViewInit,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { ServersService } from 'src/app/services/servers.service';
import { StateService } from 'src/app/services/state.service';
import { Server } from 'src/app/types/server-types';
import { ITerminalOptions } from 'xterm';
import { TerminalTailComponent, TerminalTailState } from '../terminals/terminal-tail/terminal-tail.component';
import { NgFor, AsyncPipe } from '@angular/common';

@Component({
    selector: 'dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    standalone: true,
    imports: [
        NgFor,
        TerminalTailComponent,
        AsyncPipe,
    ],
})
export class DashboardComponent implements OnInit {
  private _activeTerminals: string[] = [];
  public terminalOptions: ITerminalOptions = {
    cursorBlink: true,
    allowProposedApi: true,
    macOptionClickForcesSelection: true,
    macOptionIsMeta: true,
  };
  private _serversService = inject(ServersService);
  public stateService = inject(StateService);

  getTerminals(server: Server): string[] {
    const terminalsOfServer = Object.values(server.runningShells);
    this._activeTerminals.push(...terminalsOfServer);
    return terminalsOfServer;
  }

  ngOnInit(): void {
    this._serversService.getServers().subscribe();
  }

  onTerminalStateChange(terminalId:string , state: TerminalTailState) {
    console.log('Terminal state change ', terminalId , state);
  }
}
