import { Component, Inject, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MAT_SNACK_BAR_DATA, MatSnackBarAction, MatSnackBarActions, MatSnackBarLabel, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
  standalone: true,
  imports: [
    MatSnackBarActions,
    MatSnackBarLabel,
    MatButton,
    MatSnackBarAction,
  ],
})
export class InfoComponent {
  public data: string = inject(MAT_SNACK_BAR_DATA);
  public snackBarRef = inject(MatSnackBarRef<InfoComponent>);
}
