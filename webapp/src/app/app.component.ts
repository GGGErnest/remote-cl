import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { WebSocketService } from './services/web-socket.service';
import { tap } from 'rxjs';
import { SubPageTitleService } from './services/sub-page-title.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'RWT';
  pageTitle? = '';

  constructor(
    public readonly _authService: AuthService,
    private readonly _ws: WebSocketService,
    private readonly _subTitleService: SubPageTitleService
  ) {
    this._subTitleService.title$.subscribe({
      next: (value) => {
        console.log(value);
        this.pageTitle = value;
      },
    });
  }

  ngOnInit() {
    this._authService.isUserLoggedIn$.subscribe({next:(isUserLoggedIn)=> {
        this._ws.connect();
    }})
  }
}
