import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { NotificationService } from '../../../shared/data-access/notification.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const authToken = this.authService.getAuthToken();
    let authRequest = request;

    if (authToken) {
      authRequest = this.addTokenHeader(request, authToken);
    }

    return next.handle(authRequest).pipe(
      catchError((err) => {
        if(!authRequest.url.includes('login') && (err.status === 401 || err.status === 403)) {
            this.authService.handleAuthenticationError(err);
        }
        
        return throwError(() => err);
      })
    );
  }

  private addTokenHeader(request: HttpRequest<any>, authToken: string) {
    return request.clone({
      setHeaders: { Authorization: `Bearer ${authToken}` },
    });
  }
}
