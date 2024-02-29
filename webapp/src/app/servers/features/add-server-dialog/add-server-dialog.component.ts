import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { HostnameInputComponent } from 'src/app/servers/ui/hostname-input/hostname-input.component';
import { Server } from '../../data-access/server';

export interface ServerDialogData {
  server?: Server;
}

@Component({
  selector: 'app-add-server-dialog',
  templateUrl: './add-server-dialog.component.html',
  styleUrls: ['./add-server-dialog.component.scss'],
  standalone: true,
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    MatLabel,
    MatFormField,
    HostnameInputComponent,
    MatButton,
    MatInput,
    MatCheckbox,
    NgIf,
  ],
})
export class AddServerDialogComponent {
  private _dialogRef = inject(MatDialogRef<AddServerDialogComponent>);
  serverFormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    description: new FormControl('',Validators.required),
    connectionSettings: new FormGroup({
      host: new FormControl('',Validators.required),
      port: new FormControl(22,Validators.required),
      username: new FormControl('',Validators.required),
      password: new FormControl('',Validators.required),
      privateKey: new FormControl(''),
      usePKey: new FormControl(false),
    }),
  });

  server = inject<ServerDialogData>(MAT_DIALOG_DATA).server;

  constructor() {
    this.initForm();
  }

  private initForm(){
    if(this.server) {
      this.serverFormGroup.patchValue(this.server);
    } 
  }

  public cancel() {
    this._dialogRef.close();
  }

  public save() {
    if(this.serverFormGroup.invalid) {
      return;
    }
    this._dialogRef.close(this.serverFormGroup.value);
  }
}
