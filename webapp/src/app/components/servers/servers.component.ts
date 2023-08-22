import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ServersService } from 'src/app/services/servers.service';
import { ShellsService } from 'src/app/services/shells.service';
import { Server } from 'src/app/types/server-types';
import { AddServerDialogComponent } from '../dialog/add-server-dialog/add-server-dialog.component';
import lodash from 'lodash';

@Component({
  selector: 'app-servers',
  templateUrl: './servers.component.html',
  styleUrls: ['./servers.component.scss']
})
export class ServersComponent implements OnInit {
  private serverDialog?: MatDialogRef<AddServerDialogComponent>;
  servers: Server[]=[];

  constructor(private serversService: ServersService, public dialog: MatDialog){

  }

  ngOnInit(): void {
    this.serversService.get().subscribe((response)=> {
      this.servers = response.result;
    })
  }

  public addServer() {
    this.serverDialog = this.dialog.open<AddServerDialogComponent>(AddServerDialogComponent, {data:{
      actions:'add'
    }})
    this.serverDialog.afterClosed().subscribe(result=> {
      if(result) {
        // TODO: send some feedback to the user
        this.serversService.add(result).subscribe(response=> {
          this.servers = response.result;
        });
      }
    })
  }

  public editServer(server:Server) {
    const currentName = server.name;
    this.serverDialog = this.dialog.open<AddServerDialogComponent>(AddServerDialogComponent, {data:{
      actions:'edit',
      server
    }});

    this.serverDialog.afterClosed().subscribe(result=> {
      if(result) {
        // TODO: send some feedback to the user
        this.serversService.edit(currentName,result).subscribe(response=> {
          this.servers = response.result;
        });
      }
    })
  }

  public openShell(server:Server, shell: string) {

  }

  public stopShell(server:Server, shell: string) {
    
  }
}
