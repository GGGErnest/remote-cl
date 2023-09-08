import { AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { filter } from 'rxjs';
import { NgTerminal, NgTerminalComponent } from 'ng-terminal';
import { ServersService } from 'src/app/services/servers.service';
import { TerminalConnectionManagerService } from 'src/app/services/shells-connection-manager.service';
import { StateService } from 'src/app/services/state.service';
import { TerminalsService } from 'src/app/services/terminals.service';
import { Server } from 'src/app/types/server-types';
import { ITerminalOptions } from 'xterm';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  private _activeTerminals: string[] = [];
  private _terminalIdNgTerminal = new WeakMap<NgTerminal,string>();
  terminalOptions: ITerminalOptions = {cursorBlink: true, allowProposedApi:true, macOptionClickForcesSelection:true,macOptionIsMeta:true};

  constructor(public stateService: StateService, 
    private _serversService: ServersService,
    private _terminalConnectionManagerService: TerminalConnectionManagerService,
    private _terminalsService: TerminalsService) {

  }

  getTerminals(server: Server): string[] {
    const terminalsOfServer =Object.values(server.runningShells);
    this._activeTerminals.push(...terminalsOfServer);
    return terminalsOfServer;
  }

  

  ngOnInit(): void {
    this._serversService.getServers().subscribe();
  }

  ngAfterViewInit(): void {
  }
}
