import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from './authentication/data-access/auth.service';
import { WebSocketService } from './shared/data-access/web-socket.service';
import { tap } from 'rxjs';
import { SubPageTitleService } from './shared/data-access/sub-page-title.service';
import { NgIf, AsyncPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [
        MatToolbar,
        RouterLink,
        MatIcon,
        NgIf,
        RouterLinkActive,
        RouterOutlet,
        AsyncPipe,
    ],
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
    this._authService.isUserLoggedIn$.pipe(
      tap(isUserLoggedIn => {
        if (isUserLoggedIn) {
          this._ws.connect();
          this.startRefreshingToken();
        } else {
          this.stopRefreshingToken();
        }
      })
    ).subscribe();
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
