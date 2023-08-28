import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LogoutComponent } from './components/logout/logout.component';
import {canActivate} from './services/permission.service';
import { ServersComponent } from './components/servers/servers.component';
import { ServerComponent } from './components/server/server.component';

const routes: Routes = [
  { path: 'servers', component: ServersComponent, canActivate: [canActivate] },
  { path: 'servers/:id', component: ServerComponent, canActivate: [canActivate] },
  { path: 'logout', component: LogoutComponent, canActivate: [canActivate] },
  { path: 'login', component: LoginComponent},
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
