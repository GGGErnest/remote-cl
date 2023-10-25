import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class InfoComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: string,
  @Inject(MatSnackBarRef) public snackBarRef: MatSnackBarRef<any>) {

  }
}
