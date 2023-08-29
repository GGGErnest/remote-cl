import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { ServersService } from 'src/app/services/servers.service';
import { Server } from 'src/app/types/server-types';

@Component({
  selector: 'app-server',
  templateUrl: './server.component.html',
  styleUrls: ['./server.component.scss']
})
export class ServerComponent implements OnInit {
 server?:Server;
 constructor(private serverService: ServersService, private activatedRoute: ActivatedRoute, private localtion:Location){
  
 }

 ngOnInit(): void {
  const serverId = this.activatedRoute.snapshot.paramMap.get('id');
   if(!serverId) {
    this.localtion.back();
   }
   
   this.serverService.getServer(serverId!).subscribe((response ) => {
    if(response.result[0]) {
      this.server = response.result[0];
    }
   });
 }
}
