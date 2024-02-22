import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of } from 'rxjs';
import { concatAll, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { NotificationService } from './notification.service';
import { Router } from '@angular/router';

export interface Response {
  message: string;
  result: boolean;
  accessToken: string;
  refreshToken: string;
}

export interface Request {
  success: boolean;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authTokenKey = 'accessToken';
  private refreshTokenKey = 'refreshAccessToken';
  private apiUrl = environment.apiUrl;
  private _isUserLoggedIn = new BehaviorSubject<boolean>(this.isUserLoggedIn());
  public isUserLoggedIn$ = this._isUserLoggedIn.asObservable();

  constructor(
    private http: HttpClient, 
    private readonly _notificationService: NotificationService,
    private readonly _router: Router
  ) {
    this.isUserLoggedIn();
  }

  isUserLoggedIn(): boolean {
    if (localStorage.getItem(this.authTokenKey)) {
      return true;
    }
    return false;
  }

  getAuthToken(): string | null {
    return localStorage.getItem(this.authTokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  login(password: string, username: string) {
    return this.http
      .post<Response>(this.apiUrl + 'login', { password, username })
      .pipe(
        map((response) => {
          if (response.result) {
            localStorage.setItem(this.authTokenKey, response.accessToken);
            localStorage.setItem(this.refreshTokenKey, response.refreshToken);
            this._isUserLoggedIn.next(true);
            return of(true);
          }

          this._isUserLoggedIn.next(false);
          return of(false);
        }),
        concatAll()
      );
  }

  logout() {
    localStorage.removeItem(this.authTokenKey);
    this._router.navigate(['/login']);
    return this.http.post<Response>(this.apiUrl + 'logout', {});
  }

  refreshToken() {
    return this.http
      .post<Response>(this.apiUrl + 'token', {
        token: localStorage.getItem(this.refreshTokenKey),
      })
      .pipe(
        tap((response) => {
          localStorage.setItem(this.authTokenKey, response.accessToken);
        })
      );
  }

  public handleAuthenticationError(error: string) {
    if (error === 'TokenExpiredError') {
      this._notificationService.showError(
        'Your access token has expired, please login again'
      );
    }

    if (error === 'JsonWebTokenError') {
      this._notificationService.showError(
        'Wrong access token'
      );
    }

    if (error === 'NoAuthenticationToken') {
      this._notificationService.showError(
        'Please login before trying to access any protected'
      );
    }

    this.logout().subscribe();
  }
}
