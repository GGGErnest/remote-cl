import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { deepEqual } from '../utils/deep-equal';
import lodash from 'lodash';
import { Server } from '../../servers/data-access/server-types';
import { signalStore, withState } from '@ngrx/signals';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  private _serversStore = signalStore(withState([]));
  private _servers = new BehaviorSubject<Server[]>([]);
  servers$ = this._servers.asObservable();

  /**
   * Returns a copy of the servers
   */
  get servers(): Server[] {
    return lodash.cloneDeep(this._servers.value);
  }

  public updateServers(servers: Server[]) {
    if (deepEqual(this._servers.value, servers)) {
      return;
    }

    this._servers.next(servers);
  }
}
