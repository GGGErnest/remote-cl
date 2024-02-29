import { AsyncPipe, NgFor } from '@angular/common';
import {
  Component,
  OnInit,
  inject
} from '@angular/core';
import { Server } from 'src/app/servers/data-access/server';
import { ServersService } from 'src/app/servers/data-access/servers.service';
import { StateService } from 'src/app/shared/data-access/state.service';
import { ITerminalOptions } from 'xterm';
import { TerminalTailComponent, TerminalTailState } from '../../../terminals/features/terminal-tail/terminal-tail.component';

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
