import { ChangeDetectionStrategy, Component, Output, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { EventEmitter } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'login',
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent { 
    password = new FormControl();
    username = new FormControl();
    form = new FormGroup({password: this.password, username:this.username});

    @Output('login') loginEvent = new EventEmitter<boolean>();
  
    constructor(private authService: AuthService) {}
  
    login() {
      const {password, username} = this.form.value;
      this.authService.login(password, username).subscribe(isLoggedIn => {
        this.loginEvent.emit(isLoggedIn);
      });
    }
}
