import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../auth.service';

@Injectable()
export class ErrorHandlingInterceptor implements HttpInterceptor {

    constructor() {}

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        const cloneRequest = request.clone();

        return next.handle(cloneRequest).pipe(catchError(err => {
            if (err instanceof HttpErrorResponse) {
                console.error(err.message);
            }

            const error = err.error.message || err.statusText;
            return throwError(error);
        }));
    }
}
