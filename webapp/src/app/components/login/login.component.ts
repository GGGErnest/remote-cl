import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login(this.password).subscribe(isLoggedIn => {
      if(isLoggedIn){
        this.router.navigate(['/servers']);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}
