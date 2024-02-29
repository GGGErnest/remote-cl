import { inject } from '@angular/core';
import type { ResolveFn } from '@angular/router';
import { ServersService } from './servers.service';
import { ServersResponse } from './api-types';

export const serversResolver: ResolveFn<ServersResponse> = (route, state) => {
  return inject(ServersService).getServers();
};
