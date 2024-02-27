import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorComponent } from '../components/dumbs/notifications/error/error.component';
import { InfoComponent } from '../components/dumbs/notifications/info/info.component';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private readonly _snackBar: MatSnackBar) { }

  public showInfo(message: string): void {
    this._snackBar.openFromComponent(InfoComponent, {data: message});
  }

  public showError(errorMessage: string): void {
    this._snackBar.openFromComponent(ErrorComponent, {data: errorMessage});
  }
}
