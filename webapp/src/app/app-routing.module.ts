import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { canActivate } from './authentication/data-access/authorization.service';
import { LoginRouteComponent } from './authentication/features/login-route/login-route.component';
import { LogoutComponent } from './authentication/features/logout-route/logout-route.component';
import { DashboardRouteComponent } from './dashboard/features/dashboard-route/dashboard-route.component';
import { serversResolver } from './servers/data-access/servers.resolver';
import { ServersListComponent } from './servers/features/servers-list/servers-list.component';

const routes: Routes = [
  {
    path: 'dashboard',
    title: 'Dashboard',
    component: DashboardRouteComponent,
    canActivate: [canActivate],
    resolve: { servers: serversResolver },
  },
  {
    path: 'servers',
    title: 'Servers',
    component: ServersListComponent,
    canActivate: [canActivate],
    resolve: { servers: serversResolver },
  },
  { path: 'logout', component: LogoutComponent, canActivate: [canActivate] },
  { path: 'login', title: 'Login', component: LoginRouteComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
