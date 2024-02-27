import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef, MatDialogTitle
} from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'terminal-prompt-dialog',
  templateUrl: './terminal-prompt-dialog.component.html',
  styleUrls: ['./terminal-prompt-dialog.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    MatFormField,
    MatInput,
    MatButton,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatLabel,
  ],
})
export class TerminalPromptDialogComponent {
  public dialogRef = inject<MatDialogRef<TerminalPromptDialogComponent>>(
    MatDialogRef<TerminalPromptDialogComponent>
  );
  terminalId: string = '';

  cancel() {
    this.dialogRef.close();
  }

  accept() {
    if (this.terminalId !== '') {
      this.dialogRef.close(this.terminalId);
    }
  }
}
