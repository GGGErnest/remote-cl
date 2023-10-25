import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: string,
   @Inject(MatSnackBarRef) public snackBarRef: MatSnackBarRef<any>) {

   }
}
