import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MAT_SNACK_BAR_DATA, MatSnackBar, MatSnackBarAction, MatSnackBarActions, MatSnackBarLabel, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
  standalone: true,
  imports: [
    MatSnackBarActions,
    MatSnackBarLabel,
    MatButton,
    MatSnackBarAction,
  ],
})
export class ErrorComponent {

   public data: string = inject(MAT_SNACK_BAR_DATA);
   public snackBarRef = inject(MatSnackBarRef<ErrorComponent>);

}
