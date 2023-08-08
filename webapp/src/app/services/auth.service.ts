import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import {concatAll, map, } from 'rxjs/operators';
import { WebSocketService } from './web-socket.service';

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
  private baseUrl = 'http://localhost:3000/';

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

   private intiWSConnection(): Observable<boolean> {
    // Should start the connection
    this.webSocket.connect();
    return this.webSocket.isConnected$;
   }

  login(password:string) {
    return this.http.post<Response>(this.baseUrl+'login',{password}).pipe(
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
    return this.http.post<Response>(this.baseUrl+'logout', {});
  }
}
