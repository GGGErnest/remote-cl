import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import {concatAll, map, } from 'rxjs/operators';
import { WebSocketService } from './web-socket.service';
import { environment } from '../../environments/environment';
import { WSState } from '../types/ws-types';

export interface Response {
   message: string;
    result: boolean;
    token: string; 
}

export interface Request { success: boolean, token: string }

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authTokenKey = 'auth_token';
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private webSocket: WebSocketService) {
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

   private intiWSConnection(): Observable<WSState> {
    // Should start the connection
    this.webSocket.connect();
    return this.webSocket.state$;
   }

  login(password:string) {
    return this.http.post<Response>(this.apiUrl+'login',{password}).pipe(
      map(response => {
        if (response.result) {
          localStorage.setItem(this.authTokenKey, response.token);

          return this.intiWSConnection();
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
}
