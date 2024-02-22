import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LogoutComponent } from './components/logout/logout.component';
import {canActivate} from './services/permission.service';
import { ServersComponent } from './components/servers/servers.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { serversResolver } from './services/resolvers/servers.resolver';

const routes: Routes = [
  { path: 'dashboard', title:'Dashboard' , component: DashboardComponent, canActivate: [canActivate] },
  { path: 'servers', title:'Servers', component: ServersComponent, canActivate: [canActivate], resolve:{servers: serversResolver}},
  { path: 'logout', component: LogoutComponent, canActivate: [canActivate] },
  { path: 'login', title:'Login', component: LoginComponent},
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
