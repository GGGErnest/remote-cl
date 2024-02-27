import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginRouteComponent } from './components/routes/login-route/login-route.component';
import { LogoutComponent } from './components/routes/logout-route/logout-route.component';
import {canActivate} from './services/authorization.service';
import { ServersListComponent } from './components/controllers/servers/servers-list/servers-list.component';
import { DashboardRouteComponent } from './components/routes/dashboard-route/dashboard-route.component';
import { serversResolver } from './services/resolvers/servers.resolver';

const routes: Routes = [
  { path: 'dashboard', title:'Dashboard' , component: DashboardRouteComponent, canActivate: [canActivate] },
  { path: 'servers', title:'Servers', component: ServersListComponent, canActivate: [canActivate], resolve:{servers: serversResolver}},
  { path: 'logout', component: LogoutComponent, canActivate: [canActivate] },
  { path: 'login', title:'Login', component: LoginRouteComponent},
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
