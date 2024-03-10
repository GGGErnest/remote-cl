import { Component } from '@angular/core';
import { DashboardComponent } from '../dashboard/dashboard.component';

@Component({
  selector: 'dashboard-route',
  templateUrl: './dashboard-route.component.html',
  styleUrls: ['./dashboard-route.component.scss'],
  standalone: true,
  imports: [DashboardComponent],
})
export class DashboardRouteComponent {}
