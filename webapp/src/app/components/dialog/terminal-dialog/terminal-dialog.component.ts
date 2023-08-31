import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NgTerminal } from 'ng-terminal';
import { filter } from 'rxjs';
import { TerminalsService } from 'src/app/services/terminals.service';
import { Server } from 'src/app/types/server-types';
import { TerminalConnection } from 'src/app/types/terminal-connection';
import { ITerminalOptions} from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { SearchAddon } from 'xterm-addon-search';
import { SerializeAddon } from 'xterm-addon-serialize';
import { Unicode11Addon } from 'xterm-addon-unicode11';
import { WebglAddon } from 'xterm-addon-webgl';
 
export interface TerminalDialogData {
  terminalID:string;
  connection:TerminalConnection;
  terminalHistory: string[];
}

@Component({
  selector: 'app-terminal-dialog',
  templateUrl: './terminal-dialog.component.html',
  styleUrls: ['./terminal-dialog.component.scss']
})
export class TerminalDialogComponent implements AfterViewInit {
  private _command = '';
  private _previousCommand = '';
  private _webGlAddon = new WebglAddon();
  private _unicode11 = new Unicode11Addon();
  private _serializeAddon = new SerializeAddon();
  private _searchAddon = new SearchAddon();
  private _fitAddon = new FitAddon();



  cols = 80;
  rows = 20;
  terminalOptions: ITerminalOptions = {cursorBlink: true, allowProposedApi:true, macOptionClickForcesSelection:true,macOptionIsMeta:true};
  @ViewChild('term',{ static: false }) term!: NgTerminal;
  @ViewChild('closeBtn',{ static: false }) closeBtn!: HTMLButtonElement;

  constructor(
    public dialogRef: MatDialogRef<TerminalDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TerminalDialogData,
  ) {
    this.data.connection.output.pipe(filter(value=> this._shouldMessageBeDisplayed(value))).subscribe({next:(output)=> {
      if(output){
        this.term.write(output);
      }
    }, complete:()=> {
      this.term.underlying?.textarea?.setAttribute('disabled', 'true');
      this.closeBtn.focus();
    }})
  }

  public close() {
    this.dialogRef.close();
  }

  private _shouldMessageBeDisplayed(value:string | undefined): boolean {
    if(!value){
      return false;
    }

    if(this._previousCommand && this._previousCommand === value.trimEnd()){
      return false;
    }

    return true;
  }

  private _prompt() {
    this.term.write('\r\n');
  }

  private _onTerminalInput(input:string) {
    console.info('Data ', input);
    this.data.connection.input(input);
  }

  ngAfterViewInit(): void {
    this.term.onData().subscribe((input) => this._onTerminalInput(input));
    this.term.underlying?.onResize(({cols,rows})=> {
      
    });
    this.term.underlying?.loadAddon(this._fitAddon);
    this.term.underlying?.loadAddon(this._webGlAddon);
    this.term.underlying?.loadAddon(this._unicode11);
    this.term.underlying?.loadAddon(this._serializeAddon);
    this.term.underlying?.loadAddon(this._searchAddon);


    this.data.terminalHistory.forEach(message=> {
      this.term.write(message);
    })
  }
}
