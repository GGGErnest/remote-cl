import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginComponent } from '../../controllers/login/login.component';

@Component({
  selector: 'login-route',
  templateUrl: './login-route.component.html',
  styleUrls: ['./login-route.component.scss'],
  standalone: true,
  imports: [
    LoginComponent
  ]
})
export class LoginRouteComponent {

  constructor(private router: Router) {}

  onLogin(isLoggedIn: boolean) {
    if(isLoggedIn){
      this.router.navigate(['/dashboard']);
    }
  }
}
