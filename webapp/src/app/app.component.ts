import { Component, OnDestroy, OnInit } from '@angular/core';
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
    this._authService.isUserLoggedIn$.subscribe({next:(isUserLoggedIn)=> {
      if(isUserLoggedIn) {
        this._ws.connect();
        
        this._authService.refreshToken().subscribe();
        this._intervalId = setInterval(()=> {
          this._authService.refreshToken().subscribe();
        }, this._refreshAccessTokenInterval);

      } else {
        clearInterval(this._intervalId);
      }
    }})
  }

  ngOnDestroy(): void {
      clearInterval(this._intervalId);
  }
}
