import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Server } from 'src/app/types/server-types';

export interface ServerDialogData {
  server?: Server;
}

@Component({
  selector: 'app-add-server-dialog',
  templateUrl: './add-server-dialog.component.html',
  styleUrls: ['./add-server-dialog.component.scss']
})
export class AddServerDialogComponent {
  serverFormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    description: new FormControl('',Validators.required),
    connectionSettings: new FormGroup({
      host: new FormControl('',Validators.required),
      port: new FormControl(22,Validators.required),
      username: new FormControl('',Validators.required),
      password: new FormControl('',Validators.required),
    }),
  });
  server?: Server;

  constructor(
    public dialogRef: MatDialogRef<AddServerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ServerDialogData,
  ) {
    this.server = data.server;
    this.initForm();
  }

  private initForm(){
    if(this.data.server) {
      this.serverFormGroup.patchValue(this.data.server);
    } 
  }

  public cancel() {
    this.dialogRef.close();
  }

  public save() {
    if(this.serverFormGroup.invalid) {
      return;
    }
    this.dialogRef.close(this.serverFormGroup.value);
  }
}
