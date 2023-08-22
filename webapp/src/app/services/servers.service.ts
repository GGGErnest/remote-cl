import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Server } from '../types/server-types';

export interface ServersResponse {
  message:string;
  result: Server[];
}

@Injectable({
  providedIn: 'root'
})
export class ServersService {
  private apiUrl = environment.apiUrl+'servers';

  constructor(private http: HttpClient) {

  }

  public get() {
    return this.http.get<ServersResponse>(this.apiUrl);
  }

  public add(server:Server) {
    return this.http.post<ServersResponse>(this.apiUrl, server);
  }

  public edit(name:string, server:Server) {
    return this.http.patch<ServersResponse>( this.apiUrl+"/"+ name, server);
  }
}
