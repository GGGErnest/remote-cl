import { NgClass, NgFor, NgStyle } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Server } from 'src/app/servers/data-access/server-types';
import { ServersStore } from 'src/app/servers/data-access/servers-store';
import {
  HistorySignal,
  historySignal,
} from 'src/app/shared/utils/history-signal';
import { ITerminalOptions } from 'xterm';
import {
  TerminalTailComponent,
  TerminalTailState,
} from '../terminal-tail/terminal-tail.component';

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
export class DashboardComponent {
  public terminalOptions: ITerminalOptions = {
    cursorBlink: true,
    allowProposedApi: true,
    macOptionClickForcesSelection: true,
    macOptionIsMeta: true,
  };
  private _servers = inject(ServersStore).servers;
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
