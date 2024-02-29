import { Injectable, inject } from "@angular/core";
import { AuthService } from "./auth.service";
import { CanActivateFn } from "@angular/router";
import { Router } from '@angular/router';


@Injectable()
export class AuthorizationService {
  canActivate(authService: AuthService, router: Router): boolean {
    if(authService.isUserLoggedIn()) {
        return true;
    } 
    router.navigate(['login']);
    return false;
  }
}

export const canActivate: CanActivateFn =
    () => {
      return inject(AuthorizationService).canActivate(inject(AuthService), inject(Router));
    };