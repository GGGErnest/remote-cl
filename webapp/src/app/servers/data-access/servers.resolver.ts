import { inject } from '@angular/core';
import type { ResolveFn } from '@angular/router';
import { ServersStore } from './servers-store';

export const serversResolver: ResolveFn<void> = (route, state) => {
  return inject(ServersStore).loadAllServers();
};
