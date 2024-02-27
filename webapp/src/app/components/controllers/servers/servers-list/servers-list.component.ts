import { Component, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ServersService } from 'src/app/services/servers.service';
import { Server } from 'src/app/types/server-types';
import { AddServerDialogComponent } from '../add-server-dialog/add-server-dialog.component';
import { TerminalConnectionManagerService } from 'src/app/services/shells-connection-manager.service';
import { TerminalDialogComponent } from '../../terminals/terminal-dialog/terminal-dialog.component';
import { TerminalsService } from 'src/app/services/terminals.service';
import { StateService } from 'src/app/services/state.service';
import { TerminalPromptDialogComponent } from '../../terminals/terminal-prompt-dialog/terminal-prompt-dialog.component';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { AsyncPipe, NgFor } from '@angular/common';
import { MatButton, MatButtonModule, MatIconButton } from '@angular/material/button';

@Component({
  selector: 'servers-list',
  templateUrl: './servers-list.component.html',
  styleUrls: ['./servers-list.component.scss'],
  standalone: true,
  imports: [
    MatButton,
    MatIconButton,
    MatIcon,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    AddServerDialogComponent,
    NgFor,
    AsyncPipe,
  ],
})
export class ServersListComponent {
  private serverDialog?: MatDialogRef<AddServerDialogComponent>;
  private _serversService = inject(ServersService);
  private _dialog: MatDialog = inject(MatDialog);
  private _terminalService= inject(TerminalsService);
  private _terminalConnectionManagerService = inject(TerminalConnectionManagerService);
  public _stateService = inject(StateService);

  getTerminals(server: Server): string[] {
    return Object.values(server.runningShells);
  }


  public addServer() {
    this.serverDialog = this._dialog.open<AddServerDialogComponent>(
      AddServerDialogComponent,
      {
        data: {
          actions: 'add',
        },
      }
    );

    this.serverDialog.afterClosed().subscribe((result) => {
      if (result) {
        this._serversService.addServer(result).subscribe((response) => {
          const servers = this._stateService.servers;
          servers.push(...response.result);
          this._stateService.updateServers(servers);
        });
      }
    });
  }

  public editServer(server: Server) {
    const currentName = server.name;
    this.serverDialog = this._dialog.open(AddServerDialogComponent, {
      data: {
        actions: 'edit',
        server,
      },
    });

    this.serverDialog.afterClosed().subscribe((result) => {
      if (result) {
        // TODO: send some feedback to the user
        this._serversService
          .editServer(currentName, result)
          .subscribe((response) => {
            this._stateService.updateServers(response.result);
          });
      }
    });
  }

  public openTerminal(terminalId: string) {
    const terminalConnection =
      this._terminalConnectionManagerService.getConnection(terminalId);
      if(terminalConnection) {
        this._terminalService.getTerminalHistory(terminalId).subscribe((response) => {
          const terminalHistory = response.result;
          const terminalDialog = this._dialog.open(TerminalDialogComponent, {
            height:'80%',
            width:'80%',
            minWidth:400,
            minHeight:400,
            data: {
              terminalId: terminalId,
              connection: terminalConnection,
              terminalHistory,
            },
          });
    
          terminalDialog.afterClosed().subscribe(() => {});
        });
      }
  }

  /**
   *
   * @param terminalId Is the Unique identifier of the terminal
   */
  public stopTerminal(server: Server, terminalId: string) {
    this._terminalService.stopTerminal(server, terminalId).subscribe();
  }

  public createTerminal(server: Server) {
    const promptDialog = this._dialog.open(TerminalPromptDialogComponent);
    promptDialog.afterClosed().subscribe((terminalId) => {
      if(terminalId) {
        this._terminalService
        .create(server.name, terminalId)
        .subscribe({next: (response) => {
          if (response.result) {
            const terminalId = Object.keys(response.result)[0];
            this.openTerminal(terminalId);
          }
        }});
      }
    });
  }

  public deleteServer(server: Server) {
    this._serversService.deleteServer(server.name).subscribe();
  }
}
