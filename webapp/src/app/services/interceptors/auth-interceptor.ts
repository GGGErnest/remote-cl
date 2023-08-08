import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private authService: AuthService) {}

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        const authToken = this.authService.getAuthToken();
        const authRequest = request.clone({ setHeaders: { Authorization: `Bearer ${authToken}` }});

        return next.handle(authRequest).pipe(catchError(err => {
            if (err instanceof HttpErrorResponse && err.status === 401) {
                // Logout user if a 401 response is received
                this.authService.logout();
            }

            const error = err.error.message || err.statusText;
            return throwError(error);
        }));
    }
}
