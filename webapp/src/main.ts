import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { NgTerminalModule } from 'ng-terminal';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { provideAnimations } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app/app-routing.module';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { StateService } from './app/shared/data-access/state.service';
import { TerminalConnectionManagerService } from './app/terminals/data-access/terminal-connection-manager.service';
import { AuthorizationService } from './app/authentication/data-access/authorization.service';
import { WebSocketService } from './app/shared/data-access/web-socket.service';
import { TerminalsService } from './app/terminals/data-access/terminals.service';
import { AuthService } from './app/authentication/data-access/auth.service';
import { SubPageTitleService } from './app/shared/data-access/sub-page-title.service';
import { CustomTitleStrategy } from './app/shared/data-access/custom-title-strategy.service';
import { TitleStrategy } from '@angular/router';
import {
  MAT_SNACK_BAR_DEFAULT_OPTIONS,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import {
  MAT_DIALOG_DEFAULT_OPTIONS,
  MatDialogModule,
} from '@angular/material/dialog';
import { ErrorHandlingInterceptor } from './app/authentication/data-access/interceptors/error-handling-intercepto';
import { AuthInterceptor } from './app/authentication/data-access/interceptors/auth-interceptor';
import {
  HTTP_INTERCEPTORS,
  withInterceptorsFromDi,
  provideHttpClient,
} from '@angular/common/http';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      AppRoutingModule,
      FormsModule,
      ReactiveFormsModule,
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
      MatCheckboxModule
    ),
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
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
  ],
}).catch((err) => console.error(err));
