import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable, tap } from 'rxjs';
import { TerminalConnectionManagerService } from '../../terminals/data-access/terminal-connection-manager.service';
import { StateService } from '../../shared/data-access/state.service';
import lodash from 'lodash';
import { ServersResponse } from './api-types';
import { Server } from './server';

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
      lodash.remove(servers, (server: Server ) => server.name ===name);
      this._stateService.updateServers(servers);
    }));
  }
}
