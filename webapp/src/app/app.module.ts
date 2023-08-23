import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './components/login/login.component';
import { AuthService } from './services/auth.service';
import { CommandService } from './services/command.service';
import { PermissionsService } from './services/permission.service';
import { ShellComponent } from './components/shell/shell.component';
import { LogoutComponent } from './components/logout/logout.component';
import { AuthInterceptor } from './services/interceptors/auth-interceptor';
import { ShellsService } from './services/shells.service';
import { WebSocketService } from './services/web-socket.service';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { NgTerminalModule } from 'ng-terminal';
import { ServersComponent } from './components/servers/servers.component';
import { AddServerDialogComponent } from './components/dialog/add-server-dialog/add-server-dialog.component';
import { ServerComponent } from './components/server/server.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ShellComponent,
    LogoutComponent,
    ServersComponent,
    AddServerDialogComponent,
    ServerComponent
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
  ],
  providers: [
    {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'outline', subscriptSizing:'dynamic'}},
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
     AuthService,
     CommandService,
     ShellsService,
     WebSocketService,
     PermissionsService,
    ],
  bootstrap: [AppComponent]
})
export class AppModule { }
