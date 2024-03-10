import { NgClass, NgFor, NgStyle } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Server } from 'src/app/servers/data-access/server';
import { ServersService } from 'src/app/servers/data-access/servers.service';
import { StateService } from 'src/app/shared/data-access/state.service';
import { ITerminalOptions } from 'xterm';
import {
  TerminalTailComponent,
  TerminalTailState,
} from '../terminal-tail/terminal-tail.component';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  HistorySignal,
  historySignal,
} from 'src/app/shared/utils/history-signal';

type Terminal = {
  id: string;
  server: Server;
  state: HistorySignal<TerminalTailState>;
};

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [NgFor, TerminalTailComponent, NgClass, NgStyle],
})
export class DashboardComponent implements OnInit {
  public terminalOptions: ITerminalOptions = {
    cursorBlink: true,
    allowProposedApi: true,
    macOptionClickForcesSelection: true,
    macOptionIsMeta: true,
  };
  private _serversService = inject(ServersService);
  private _stateService = inject(StateService);
  private _servers = toSignal(this._stateService.servers$, {
    initialValue: [],
  });
  public terminals = computed(() => {
    const terminalsData = new Map<string, Terminal>();
    for (const server of this._servers()) {
      for (const terminalId in server.runningShells) {
        const terminalData: Terminal = {
          id: terminalId,
          server: server,
          state: historySignal<TerminalTailState>('normal'),
        };

        terminalsData.set(terminalId, terminalData);
      }
    }
    return terminalsData;
  });

  public fullscreen = signal<string | undefined>(undefined);

  ngOnInit(): void {
    this._serversService.getServers().subscribe();
  }

  onTerminalStateChange(terminalId: string, state: TerminalTailState) {
    const targetTerminal = this.terminals().get(terminalId)!;
    const exitingFullScreen =
      targetTerminal.state() === 'fullscreen' && state === 'normal';
    if (exitingFullScreen) {
      targetTerminal.state.rollback();
      this.fullscreen.set(undefined);
    } else if (state === 'fullscreen') {
      targetTerminal.state.setNoHistory(state);
      this.fullscreen.set(terminalId);
    } else {
      targetTerminal.state.set(state);
    }

    for (const terminal of this.terminals().values()) {
      if (terminalId !== terminal.id) {
        if (exitingFullScreen) {
          terminal.state.rollback();
          continue;
        }

        if (state === 'fullscreen') {
          terminal.state.setNoHistory('minimized');
          continue;
        }
      }
    }
  }
}
