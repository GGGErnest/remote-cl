import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Server } from '../types/server-types';
import { Observable, tap } from 'rxjs';
import { ServersResponse } from '../types/api/response-types';
import { TerminalConnectionManagerService } from './shells-connection-manager.service';
import { StateService } from './state.service';
import lodash from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class ServersService {
  private apiUrl = environment.apiUrl + 'servers/';

  constructor(
    private http: HttpClient,
    private _termConnManagerService: TerminalConnectionManagerService,
    private _stateService: StateService
  ) {}

  public getServer(name: string) {
    return this.http.get<ServersResponse>(this.apiUrl + name);
  }

  public getServers(): Observable<ServersResponse> {
    return this.http.get<ServersResponse>(this.apiUrl).pipe(
      tap((response) => {
        this._stateService.updateServers(response.result);
        response.result.forEach((server) => {
          this._termConnManagerService.init(Object.values(server.runningShells));
        });
      })
    );
  }

  public addServer(server: Server) {
    return this.http.post<ServersResponse>(this.apiUrl, server);
  }

  public editServer(name: string, server: Server) {
    return this.http.patch<ServersResponse>(this.apiUrl + name, server);
  }

  public deleteServer(name:string) {
    return this.http.delete<ServersResponse>(this.apiUrl+name).pipe(tap(response=> {
      // updating state after removing a server
      const servers = this._stateService.servers;
      lodash.remove(servers,(server)=>server.name ===name);
      this._stateService.updateServers(servers);
    }));
  }
}
