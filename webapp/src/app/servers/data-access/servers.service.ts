import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ServersResponse } from './api-types';
import { Server } from './server-types';

@Injectable({
  providedIn: 'root',
})
export class ServersService {
  private apiUrl = environment.apiUrl + 'servers/';
  private http = inject(HttpClient);

  public async getServer(name: string) {
    return this.http.get<ServersResponse>(this.apiUrl + name);
  }

  public async getServers() {
    return firstValueFrom(this.http.get<ServersResponse>(this.apiUrl));
  }

  public async addServer(server: Server) {
    return firstValueFrom(this.http.post<ServersResponse>(this.apiUrl, server));
  }

  public async editServer(server: Server) {
    return firstValueFrom(
      this.http.patch<ServersResponse>(this.apiUrl + server.name, server)
    );
  }

  public async deleteServer(name: string) {
    return firstValueFrom(
      this.http.delete<ServersResponse>(this.apiUrl + name)
    );
  }
}
