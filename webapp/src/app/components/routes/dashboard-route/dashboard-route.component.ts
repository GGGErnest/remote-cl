import {
  AfterViewInit,
  Component,
  OnInit,
} from '@angular/core';
import { ServersService } from 'src/app/services/servers.service';
import { StateService } from 'src/app/services/state.service';
import { Server } from 'src/app/types/server-types';
import { ITerminalOptions } from 'xterm';
import { TerminalTailComponent } from '../../controllers/terminals/terminal-tail/terminal-tail.component';
import { NgFor, AsyncPipe } from '@angular/common';

@Component({
    selector: 'dashboard-route',
    templateUrl: './dashboard-route.component.html',
    styleUrls: ['./dashboard-route.component.scss'],
    standalone: true,
    imports: [
        NgFor,
        TerminalTailComponent,
        AsyncPipe,
    ],
})
export class DashboardRouteComponent implements OnInit, AfterViewInit {
  private _activeTerminals: string[] = [];
  terminalOptions: ITerminalOptions = {
    cursorBlink: true,
    allowProposedApi: true,
    macOptionClickForcesSelection: true,
    macOptionIsMeta: true,
  };

  constructor(
    public stateService: StateService,
    private _serversService: ServersService,
  ) {}

  getTerminals(server: Server): string[] {
    const terminalsOfServer = Object.values(server.runningShells);
    this._activeTerminals.push(...terminalsOfServer);
    return terminalsOfServer;
  }

  ngOnInit(): void {
    this._serversService.getServers().subscribe();
  }

  ngAfterViewInit(): void {}
}
