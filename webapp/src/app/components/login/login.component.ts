import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  password = new FormControl();
  username = new FormControl();
  form = new FormGroup({password: this.password, username:this.username});

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    const {password, username} = this.form.value;
    this.authService.login(password, username).subscribe(isLoggedIn => {
      if(isLoggedIn){
        this.router.navigate(['/servers']);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}
