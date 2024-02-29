import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-servers-route',
    standalone: true,
    imports: [
        RouterModule,
    ],
    template: `<p>servers-route works!</p>`,
    styleUrl: './servers-route.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServersRouteComponent { }
