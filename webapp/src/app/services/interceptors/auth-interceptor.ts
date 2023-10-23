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

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );

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
        if ((err === 'TokenExpiredError' || err === 'JsonWebTokenError')
         && !authRequest.url.includes('login')) {
            return this.handleAuthenticationErrors(authRequest, next)
        }

        if(err === 'NoAuthenticationToken') {
          this.authService.logout();
        }

        return throwError(() => err);
      })
    );
  }

  private handleAuthenticationErrors(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ) {
    console.log('Authentication error-handling');
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const canRefresh = !!this.authService.getRefreshToken();

      if (canRefresh) {
        console.log('Refreshing the token');
        return this.authService.refreshToken().pipe(
          switchMap((response) => {
            this.isRefreshing = false;
            this.refreshTokenSubject.next(response.accessToken);

            return next.handle(
              this.addTokenHeader(request, response.accessToken)
            );
          }),
          catchError((err) => {
            this.isRefreshing = false;

            this.authService.logout();
            return throwError(() => err);
          })
        );
      }
    }

    return this.refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => next.handle(this.addTokenHeader(request, token)))
    );
  }

  private addTokenHeader(request: HttpRequest<any>, authToken: string) {
    return request.clone({
      setHeaders: { Authorization: `Bearer ${authToken}` },
    });
  }
}
