import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ServersService, ServersResponse } from 'src/app/services/servers.service';
import { Server } from 'src/app/types/server-types';
import { AddServerDialogComponent } from '../dialog/add-server-dialog/add-server-dialog.component';
import { TerminalConnectionManagerService } from 'src/app/services/shells-connection-manager.service';
import { TerminalDialogComponent } from '../dialog/terminal-dialog/terminal-dialog.component';
import { ShellsService } from 'src/app/services/shells.service';

@Component({
  selector: 'app-servers',
  templateUrl: './servers.component.html',
  styleUrls: ['./servers.component.scss']
})
export class ServersComponent implements OnInit {
  private serverDialog?: MatDialogRef<AddServerDialogComponent>;
  servers: Server[]=[];

  constructor(private _serversService: ServersService, public dialog: MatDialog,
    private _terminalService: ShellsService,
    private _terminalConnectionManagerService: TerminalConnectionManagerService){

  }

 getTerminals(server: Server): string[] {
    return Object.values(server.runningShells)
  }

  private _getServers() {
    this._serversService.getServers().subscribe((response)=> {
      this.servers = response.result;
      this.servers.forEach((server)=> {
        const terminals = this.getTerminals(server)
      this._terminalConnectionManagerService.init(terminals);
      })
    });
  }

  ngOnInit(): void {
    this._getServers();
  }

  public addServer() {
    this.serverDialog = this.dialog.open<AddServerDialogComponent>(AddServerDialogComponent, {data:{
      actions:'add'
    }})
    this.serverDialog.afterClosed().subscribe(result=> {
      if(result) {
        // TODO: send some feedback to the user
        this._serversService.addServer(result).subscribe((response: ServersResponse) => {
          this.servers = response.result;
        });
      }
    })
  }

  public editServer(server:Server) {
    const currentName = server.name;
    this.serverDialog = this.dialog.open(AddServerDialogComponent, {data:{
      actions:'edit',
      server
    }});

    this.serverDialog.afterClosed().subscribe(result=> {
      if(result) {
        // TODO: send some feedback to the user
        this._serversService.editServer(currentName,result).subscribe((response: ServersResponse )=> {
          this.servers = response.result;
        });
      }
    })
  }

  public openTerminal(terminalId: string) {
    const terminalConnection = this._terminalConnectionManagerService.getConnection(terminalId);
    this._terminalService.getShellHistory(terminalId).subscribe((response)=> {
      const terminalHistory = response.result;
      const terminalDialog = this.dialog.open(TerminalDialogComponent, {data:{
        terminalId:terminalId,
        connection: terminalConnection,
        terminalHistory
      }});
  
      terminalDialog.afterClosed().subscribe(()=> {
      })
    })
  }

  public stopTerminal(server:Server, terminal: string) {
    
  }

  public createTerminal(serverName: string) {
    this._terminalService.create(serverName).subscribe((response)=> {
      if(response.result && response.result[0]){
        const terminalId = response.result[0];
        // this._getServers();
        this._terminalConnectionManagerService.init([terminalId]);
        this.openTerminal(terminalId);
      }
    });
  }
}
