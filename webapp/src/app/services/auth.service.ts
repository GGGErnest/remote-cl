import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import {concatAll, map, tap } from 'rxjs/operators';
import { WebSocketService } from './web-socket.service';
import { environment } from '../../environments/environment';
import { WSState } from '../types/ws-types';

export interface Response {
    message: string;
    result: boolean;
    accessToken: string;
    refreshToken:string;
}

export interface Request { success: boolean, token: string }

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authTokenKey = 'accessToken';
  private refreshTokenKey = 'refreshAccessToken';
  private apiUrl = environment.apiUrl;
  private _isUserLoggedIn = new BehaviorSubject<boolean>(false);
  public isUserLoggedIn$ = this._isUserLoggedIn.asObservable();

  constructor(private http: HttpClient) {
    this.isUserLoggedIn();
   }

   isUserLoggedIn(): boolean{
    if(localStorage.getItem(this.authTokenKey)) {
      return true;
    }
    return false
   }

   getAuthToken(): string | null {
    return localStorage.getItem(this.authTokenKey);
   }

   getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
   }

  login(password:string, username:string) {
    return this.http.post<Response>(this.apiUrl+'login',{password, username}).pipe(
      map(response => {
        if (response.result) {
          localStorage.setItem(this.authTokenKey, response.accessToken);
          localStorage.setItem(this.refreshTokenKey, response.refreshToken);

          return of(true);
        }

        return of(false);
      }),
      concatAll()
    );
  }

  logout() {
    localStorage.removeItem(this.authTokenKey);
    return this.http.post<Response>(this.apiUrl+'logout', {});
  }

  refreshToken() {
    return this.http.post<Response>(this.apiUrl+'token', {token:localStorage.getItem(this.refreshTokenKey)}).pipe(
      tap((response) => {
        localStorage.setItem(this.authTokenKey, response.accessToken);
      })
    );
  }
}
