import { Component, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ServersService } from 'src/app/servers/data-access/servers.service';
import { AddServerDialogComponent } from '../add-server-dialog/add-server-dialog.component';
import { TerminalConnectionManagerService } from 'src/app/terminals/data-access/terminal-connection-manager.service';
import { TerminalDialogComponent } from '../../../terminals/features/terminal-dialog/terminal-dialog.component';
import { TerminalsService } from 'src/app/terminals/data-access/terminals.service';
import { StateService } from 'src/app/shared/data-access/state.service';
import { TerminalPromptDialogComponent } from '../../../terminals/features/terminal-prompt-dialog/terminal-prompt-dialog.component';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { AsyncPipe, NgFor } from '@angular/common';
import {
  MatButton,
  MatButtonModule,
  MatIconButton,
} from '@angular/material/button';
import { Server } from '../../data-access/server-types';
import { ServersStore } from '../../data-access/servers-store';
import { firstValueFrom } from 'rxjs';
import { TerminalsStore } from 'src/app/terminals/data-access/terminals-store';

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
  private serverDialog?: MatDialogRef<AddServerDialogComponent, Server>;
  private _dialog: MatDialog = inject(MatDialog);
  private _terminalsStore = inject(TerminalsStore);
  private _terminalConnectionManagerService = inject(
    TerminalConnectionManagerService
  );
  private _serversStore = inject(ServersStore);
  public servers = this._serversStore.servers;

  getTerminals(server: Server): string[] {
    return Object.values(server.runningShells);
  }

  public async addServer() {
    this.serverDialog = this._dialog.open<AddServerDialogComponent>(
      AddServerDialogComponent,
      {
        data: {
          actions: 'add',
        },
      }
    );

    const result = await firstValueFrom(this.serverDialog.afterClosed());
    if (result) {
      this._serversStore.addServer(result);
    }
  }

  public async editServer(server: Server) {
    const currentName = server.name;
    this.serverDialog = this._dialog.open(AddServerDialogComponent, {
      data: {
        actions: 'edit',
        server,
      },
    });

    const result = await firstValueFrom(this.serverDialog.afterClosed());
    if (result) {
      // TODO: send some feedback to the user
      this._serversStore.editServer(result);
    }
  }

  public async openTerminal(terminalId: string) {
    const terminalConnection =
      this._terminalConnectionManagerService.getConnection(terminalId);
    if (terminalConnection) {
      try {
        const terminalHistory = await this._terminalsStore.getTerminalHistory(
          terminalId
        );
        const terminalDialog = this._dialog.open(TerminalDialogComponent, {
          height: '80%',
          width: '80%',
          minWidth: 400,
          minHeight: 400,
          data: {
            terminalId: terminalId,
            connection: terminalConnection,
            terminalHistory,
          },
        });

        await firstValueFrom(terminalDialog.afterClosed());
      } catch (error) {
        console.error(error);
      }
    }
  }

  /**
   *
   * @param terminalId Is the Unique identifier of the terminal
   */
  public async stopTerminal(server: Server, terminalId: string) {
    return this._terminalsStore.stopTerminal(server.name, terminalId);
  }

  public async createTerminal(server: Server) {
    const promptDialog = this._dialog.open(TerminalPromptDialogComponent);
    const proposedTerminalId = await firstValueFrom(promptDialog.afterClosed());
    if (proposedTerminalId) {
      const terminalId = await this._terminalsStore.create(
        server.name,
        proposedTerminalId
      );
      if (terminalId) {
        this.openTerminal(terminalId);
      }
    }
  }

  public deleteServer(server: Server) {
    this._serversStore.deleteServer(server.name);
  }
}
