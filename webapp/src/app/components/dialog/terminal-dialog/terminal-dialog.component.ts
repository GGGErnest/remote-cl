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
      switch(input) {
        case '\u0012': // Ctrl+R
          // this._searchAddon.findNext(input);
          break;
        case '\r': // Carriage Return (When Enter is pressed)
          this.data.connection.input(this._command+"\r");
          this._previousCommand = this._command;
          this._command = '';
          this._prompt();
        break;
        case '\u007f': // Delete (When Backspace is pressed)
          if(this._command.length > 0){
            this._command = this._command.slice(0,this._command.length-1);
            this.term.write('\b \b');
          }
          break;
        case '\u0003': // End of Text (When Ctrl and C are pressed)
          this.data.connection.input("\u0003");
          this.term.write("^C");
          this._prompt();
          break;
        default:
          this.term.write(input);
          this._command+= input;
          break;
      }
  }

  ngAfterViewInit(): void {
    this.term.onData().subscribe((input) => this._onTerminalInput(input));

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
