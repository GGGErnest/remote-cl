import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../notification.service';

@Injectable()
export class ErrorHandlingInterceptor implements HttpInterceptor {

    constructor(private readonly _notificationService: NotificationService) {

    }

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        const cloneRequest = request.clone();

        return next.handle(cloneRequest).pipe(catchError(err => {
            if (err instanceof HttpErrorResponse) {
                console.error(err.message);
                this._notificationService.showError(err.message);
            }

            const error = err.error.message || err.statusText;
            if(err) {
                this._notificationService.showError(error);
            }
            return throwError(() => error);
        }));
    }
}
