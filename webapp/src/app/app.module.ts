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

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './components/login/login.component';
import { AuthService } from './services/auth.service';
import { CommandService } from './services/command.service';
import { PermissionsService } from './services/permission.service';
import { CommandComponent } from './components/command/command.component';
import { LogoutComponent } from './components/logout/logout.component';
import { AuthInterceptor } from './services/interceptors/auth-interceptor';
import { ThreadService } from './services/thread.service';
import { WebSocketService } from './services/web-socket.service';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    CommandComponent,
    LogoutComponent
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
  ],
  providers: [
    {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'outline'}},
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
     AuthService,
     CommandService,
     ThreadService,
     WebSocketService,
     PermissionsService,
    ],
  bootstrap: [AppComponent]
})
export class AppModule { }
