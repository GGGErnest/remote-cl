import {
  AfterViewInit,
  Component,
  OnInit,
} from '@angular/core';
import { ServersService } from 'src/app/servers/data-access/servers.service';
import { StateService } from 'src/app/shared/data-access/state.service';
import { ITerminalOptions } from 'xterm';
import { TerminalTailComponent } from '../../../terminals/features/terminal-tail/terminal-tail.component';
import { NgFor, AsyncPipe } from '@angular/common';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { Server } from 'src/app/servers/data-access/server';

@Component({
    selector: 'dashboard-route',
    templateUrl: './dashboard-route.component.html',
    styleUrls: ['./dashboard-route.component.scss'],
    standalone: true,
    imports: [
        DashboardComponent
    ],
})
export class DashboardRouteComponent {
  
}
