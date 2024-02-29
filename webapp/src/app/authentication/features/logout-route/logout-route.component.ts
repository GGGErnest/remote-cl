import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../data-access/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'logout-route',
  templateUrl: './logout-route.component.html',
  styleUrls: ['./logout-route.component.scss']
})
export class LogoutComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router){

  }

  ngOnInit() {
    this.authService.logout().subscribe();
    this.router.navigate(['/login']);
  }
}
