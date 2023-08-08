import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { WebSocketService } from './services/web-socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Remote Web Terminal';

  constructor(public authService: AuthService, private ws: WebSocketService) {}

  ngOnInit() {
    this.ws.connect();
  }
}
