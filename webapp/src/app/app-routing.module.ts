import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { CommandComponent } from './components/command/command.component';
import { LogoutComponent } from './components/logout/logout.component';
import {canActivate} from './services/permission.service';

const routes: Routes = [
  { path: 'logout', component: LogoutComponent, canActivate: [canActivate] },
  { path: 'command', component: CommandComponent, canActivate: [canActivate] },
  { path: 'login', component: LoginComponent},
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
