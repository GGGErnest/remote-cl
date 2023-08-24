import { Component, Inject, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NgTerminal } from 'ng-terminal';
import { ShellsService } from 'src/app/services/shells.service';
import { Server } from 'src/app/types/server-types';

export interface ShellDialogData {
  shellName:string;
  shellService:ShellsService;
}

@Component({
  selector: 'app-shell-dialog',
  templateUrl: './shell-dialog.component.html',
  styleUrls: ['./shell-dialog.component.scss']
})
export class ShellDialogComponent {
  
  @ViewChild('term',{ static: true }) term!: NgTerminal;

  constructor(
    public dialogRef: MatDialogRef<ShellDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ShellDialogData,
  ) {
    
  }

  onTerminalKey(terminalEvent:{ key: string, domEvent: KeyboardEvent } ): void {
    const { domEvent:event ,key} = terminalEvent;
    console.log('keyboard event:' + event.code + ', ' + event.key);

      const printable = !event.altKey && !event.ctrlKey && !event.metaKey;
      
      
      if (event.code === '13') {
        this.term.write('\r\n$ ');
      } else if (event.code === 'Backspace') {
        this.term.write('\b \b');
        if (this.command.length > 0) {
         this.command = this.command.substr(0, this.command.length - 1);
        }
      } else if(event.code === 'Enter') {
          this.executeCommand();
      } else if (printable) {
        this.term.write(key);
        this.command+= key;
      }
  }

  public close() {
    this.dialogRef.close();
  }
}
