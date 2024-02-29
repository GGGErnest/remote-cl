import { NgStyle } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ViewChild,
  inject,
  input,
  model
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { NgTerminalComponent, NgTerminalModule } from 'ng-terminal';
import { TerminalConnectionManagerService } from 'src/app/services/shells-connection-manager.service';
import { TerminalsService } from 'src/app/services/terminals.service';
import { Server } from 'src/app/types/server-types';
import { TerminalConnection } from 'src/app/types/terminal-connection';
import { ITerminalOptions } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { SearchAddon } from 'xterm-addon-search';
import { SerializeAddon } from 'xterm-addon-serialize';
import { Unicode11Addon } from 'xterm-addon-unicode11';

export type TerminalTailState  = 'normal'| 'maximize' | 'minimized';

@Component({
    selector: 'app-terminal-tail',
    templateUrl: './terminal-tail.component.html',
    styleUrls: ['./terminal-tail.component.scss'],
    standalone: true,
    imports: [
        MatCard,
        MatCardHeader,
        MatCardTitle,
        MatIconButton,
        MatIcon,
        MatCardContent,
        NgTerminalModule,
        NgStyle,
    ],
})
export class TerminalTailComponent implements AfterViewInit {
  private _unicode11 = new Unicode11Addon();
  private _serializeAddon = new SerializeAddon();
  private _searchAddon = new SearchAddon();
  private _fitAddon = new FitAddon();
  private _terminalConnection?: TerminalConnection;
  private _terminalConnectionManagerService = inject(TerminalConnectionManagerService);
  private _terminalsService = inject(TerminalsService);

  public state = model<'normal'| 'maximize' | 'minimized'>('normal');
  terminalId = input.required<string>();
  server = input.required<Server>();

  @ViewChild(NgTerminalComponent) terminal!: NgTerminalComponent;
  terminalOptions: ITerminalOptions = {
    cursorBlink: true,
    allowProposedApi: true,
    macOptionClickForcesSelection: true,
    macOptionIsMeta: true,
  };

  initTerminal() {
    this._terminalConnection =
      this._terminalConnectionManagerService.getConnection(this.terminalId());
    this.terminal
      .onData()
      .subscribe((input) => this._terminalConnection?.input(input));
    this.terminal.underlying?.loadAddon(this._fitAddon);
    this.terminal.underlying?.loadAddon(this._unicode11);
    this.terminal.underlying?.loadAddon(this._serializeAddon);
    this.terminal.underlying?.loadAddon(this._searchAddon);

    if (this._terminalConnection) {
      this._terminalsService
        .getTerminalHistory(this.terminalId())
        .subscribe((response) => {
          const terminalHistory = response.result;

          terminalHistory.forEach((message) => {
            this.terminal.write(message);
            this._fitAddon.fit();
          });

          this._terminalConnection!.output.subscribe({
            next: (output) => {
              if (output) {
                this.terminal.write(output);
              }
            },
            complete: () => {
              this.terminal.underlying?.textarea?.setAttribute(
                'disabled',
                'true'
              );
            },
          });
        });
    }
  }

  open() {}

  stop() {
    this._terminalsService.stopTerminal(this.server(), this.terminalId()).subscribe();
  }

  /**
   * This function will reduce the size of the component but keeping 
   * the toolbar visible with all the available options to 
   */
  minimizeMazimize() {
    console.log('Minimize clicked');

    if(this.state() === 'minimized') {
      this.state.set('maximize');
      return;
    }

    if(this.state() === 'maximize' || this.state() === 'normal') {
      this.state.set('minimized');
      return;
    }
  }

  ngAfterViewInit(): void {
    this.initTerminal();
  }
}
