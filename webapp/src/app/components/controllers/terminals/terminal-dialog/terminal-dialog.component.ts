import { AfterViewInit, Component, Inject, ViewChild, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { NgTerminal, NgTerminalModule } from 'ng-terminal';
import { TerminalConnection } from 'src/app/types/terminal-connection';
import { ITerminalOptions } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { SearchAddon } from 'xterm-addon-search';
import { SerializeAddon } from 'xterm-addon-serialize';
import { Unicode11Addon } from 'xterm-addon-unicode11';
import { MatButton } from '@angular/material/button';
 
export interface TerminalDialogData {
  terminalID:string;
  connection:TerminalConnection;
  terminalHistory: string[];
}

const defaultTerminalOptions: ITerminalOptions = {cursorBlink: true, allowProposedApi:true, macOptionClickForcesSelection:true,macOptionIsMeta:true};

@Component({
    selector: 'app-terminal-dialog',
    templateUrl: './terminal-dialog.component.html',
    styleUrls: ['./terminal-dialog.component.scss'],
    standalone: true,
    imports: [MatDialogTitle, MatDialogContent, NgTerminalModule, MatDialogActions, MatButton]
})
export class TerminalDialogComponent implements AfterViewInit {
  private _unicode11 = new Unicode11Addon();
  private _serializeAddon = new SerializeAddon();
  private _searchAddon = new SearchAddon();
  private _fitAddon = new FitAddon();
  terminalOptions = defaultTerminalOptions;
  public dialogRef = inject<MatDialogRef<TerminalDialogComponent>>(MatDialogRef<TerminalDialogComponent>);
  public data: TerminalDialogData = inject(MAT_DIALOG_DATA);

  @ViewChild('term',{ static: false }) term!: NgTerminal;
  @ViewChild('closeBtn',{ static: false }) closeBtn!: HTMLButtonElement;

  public close() {
    this.dialogRef.close();
  }

  private _onTerminalInput(input:string) {
    console.info('Data ', input);
    this.data.connection.input(input);
  }

  ngAfterViewInit(): void {
    this.data.connection.output.subscribe({next:(output)=> {
      if(output){
        this.term.write(output);
      }
    }, complete:()=> {
      this.term.underlying?.textarea?.setAttribute('disabled', 'true');
      this.closeBtn.focus();
    }})
    
    this.term.onData().subscribe((input) => this._onTerminalInput(input));
    this.term.underlying?.loadAddon(this._fitAddon);
    this.term.underlying?.loadAddon(this._unicode11);
    this.term.underlying?.loadAddon(this._serializeAddon);
    this.term.underlying?.loadAddon(this._searchAddon);


    this.data.terminalHistory.forEach(message=> {
      this.term.write(message);
      this._fitAddon.fit();
    })
  }
}
