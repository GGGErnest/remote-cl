import { NO_ERRORS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';

import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthService } from './services/auth.service';
import { AuthorizationService } from './services/authorization.service';
import { AuthInterceptor } from './services/interceptors/auth-interceptor';
import { TerminalsService } from './services/terminals.service';
import { WebSocketService } from './services/web-socket.service';

import {
  MAT_DIALOG_DEFAULT_OPTIONS,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  MAT_SNACK_BAR_DEFAULT_OPTIONS,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import { TitleStrategy } from '@angular/router';
import { NgTerminalModule } from 'ng-terminal';
import { TerminalDialogComponent } from './components/controllers/terminals/terminal-dialog/terminal-dialog.component';
import { TerminalTailComponent } from './components/controllers/terminals/terminal-tail/terminal-tail.component';
import { ErrorComponent } from './components/dumbs/notifications/error/error.component';
import { InfoComponent } from './components/dumbs/notifications/info/info.component';
import { DashboardRouteComponent } from './components/routes/dashboard-route/dashboard-route.component';
import { CustomTitleStrategy } from './services/custom-title-strategy.service';
import { ErrorHandlingInterceptor } from './services/interceptors/error-handling-intercepto';
import { TerminalConnectionManagerService } from './services/shells-connection-manager.service';
import { StateService } from './services/state.service';
import { SubPageTitleService } from './services/sub-page-title.service';

@NgModule({
  declarations: [
    AppComponent,
    TerminalDialogComponent,
    DashboardRouteComponent,
    TerminalTailComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatIconModule,
    NgTerminalModule,
    MatCardModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatButtonToggleModule,
    MatCheckboxModule,
  ],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline', subscriptSizing: 'dynamic' },
    },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorHandlingInterceptor,
      multi: true,
    },
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: { hasBackdrop: true, disableClose: true },
    },
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 2500 } },
    {
      provide: TitleStrategy,
      useClass: CustomTitleStrategy,
    },
    SubPageTitleService,
    AuthService,
    TerminalsService,
    WebSocketService,
    AuthorizationService,
    TerminalConnectionManagerService,
    StateService,
  ],
  bootstrap: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class AppModule {}
