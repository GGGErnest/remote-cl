import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { WebSocketService } from './services/web-socket.service';
import { tap } from 'rxjs';
import { SubPageTitleService } from './services/sub-page-title.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'RWT';
  pageTitle? = '';
  private _refreshAccessTokenInterval = 1 * 60_000;
  private _intervalId: ReturnType<typeof setInterval> | undefined;


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
    this._authService.isUserLoggedIn$.subscribe(isUserLoggedIn => {
      if (isUserLoggedIn) {
        this._ws.connect();
        this.startRefreshingToken();
      } else {
        this.stopRefreshingToken();
      }
    });
  }

  startRefreshingToken() {
    this.refreshToken();
    this._intervalId = setInterval(() => this.refreshToken(), this._refreshAccessTokenInterval);
  }
  
  stopRefreshingToken() {
    clearInterval(this._intervalId);
  }
  
  refreshToken() {
    this._authService.refreshToken().subscribe();
  }

  ngOnDestroy(): void {
      clearInterval(this._intervalId);
  }
}
