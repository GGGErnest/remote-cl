import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
  ServersService,
} from 'src/app/services/servers.service';
import { Server } from 'src/app/types/server-types';
import { AddServerDialogComponent } from '../dialog/add-server-dialog/add-server-dialog.component';
import { TerminalConnectionManagerService } from 'src/app/services/shells-connection-manager.service';
import { TerminalDialogComponent } from '../dialog/terminal-dialog/terminal-dialog.component';
import { TerminalsService } from 'src/app/services/terminals.service';
import { CreateTerminalResponse } from 'src/app/types/api/response-types';
import lodash from 'lodash';
import { StateService } from 'src/app/services/state.service';
@Component({
  selector: 'app-servers',
  templateUrl: './servers.component.html',
  styleUrls: ['./servers.component.scss'],
})
export class ServersComponent implements OnInit {
  private serverDialog?: MatDialogRef<AddServerDialogComponent>;

  constructor(
    private _serversService: ServersService,
    public dialog: MatDialog,
    private _terminalService: TerminalsService,
    private _terminalConnectionManagerService: TerminalConnectionManagerService,
    public _stateService: StateService
  ) {}

  getTerminals(server: Server): string[] {
    return Object.values(server.runningShells);
  }

  ngOnInit(): void {
    this._serversService.getServers().subscribe();
  }

  public addServer() {
    this.serverDialog = this.dialog.open<AddServerDialogComponent>(
      AddServerDialogComponent,
      {
        data: {
          actions: 'add',
        },
      }
    );
    this.serverDialog.afterClosed().subscribe((result) => {
      if (result) {
        this._serversService.addServer(result)
          .subscribe((response) => {
            this._stateService.updateServers(response.result);
          });
      }
    });
  }

  public editServer(server: Server) {
    const currentName = server.name;
    this.serverDialog = this.dialog.open(AddServerDialogComponent, {
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
    this._terminalService.getShellHistory(terminalId).subscribe((response) => {
      const terminalHistory = response.result;
      const terminalDialog = this.dialog.open(TerminalDialogComponent, {
        data: {
          terminalId: terminalId,
          connection: terminalConnection,
          terminalHistory,
        },
      });

      terminalDialog.afterClosed().subscribe(() => {});
    });
  }

  /**
   * 
   * @param terminalId Is the Unique identifier of the terminal
   */
  public stopTerminal(server:Server, terminalId:string) {
    this._terminalService.stopTerminal(server, terminalId).subscribe();
  }

  public createTerminal(server: Server) {
    this._terminalService.create(server.name).subscribe((response) => {
      if (response.result) {
        const terminalId = Object.keys(response.result)[0];
        this.openTerminal(terminalId);
      }
    });
  }

  public deleteServer(server:Server) {
    this._serversService.deleteServer(server.name).subscribe();
  }
}
