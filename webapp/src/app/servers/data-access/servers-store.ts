import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Server, ServersState } from './server-types';
import { ServersService } from './servers.service';
import { inject } from '@angular/core';
import { NotificationService } from 'src/app/shared/data-access/notification.service';
import { TerminalConnectionManagerService } from 'src/app/terminals/data-access/terminal-connection-manager.service';

const initialState: ServersState = {
  servers: [],
  isLoading: false,
  filters: { sort: 'asc', search: '' },
};

export const ServersStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const serversService = inject(ServersService);
    const notificationService = inject(NotificationService);
    const termConnManagerService = inject(TerminalConnectionManagerService);

    return {
      async loadAllServers() {
        patchState(store, { isLoading: true });
        try {
          const { result } = await serversService.getServers();
          result.forEach((server) => {
            termConnManagerService.init(Object.values(server.runningShells));
          });
          patchState(store, {
            servers: result,
            isLoading: false,
          });
        } catch (e) {
          patchState(store, { isLoading: false });
          notificationService.showError('Error loading servers');
        }
      },
      async addServer(server: Server) {
        patchState(store, { isLoading: true });
        try {
          const response = await serversService.addServer(server);
          patchState(store, {
            servers: [...store.servers(), ...response.result],
            isLoading: false,
          });
        } catch (e) {
          patchState(store, { isLoading: false });
          notificationService.showError('Error adding server');
          //TODO: handle error
        }
      },
      async editServer(server: Server) {
        patchState(store, { isLoading: true });
        try {
          await serversService.editServer(server);
          const pos = store
            .servers()
            .findIndex((serverItem) => server.name === serverItem.name);
          const servers = store.servers().splice(pos, 1, server);

          patchState(store, { servers, isLoading: false });
        } catch (e) {
          patchState(store, { isLoading: false });
          notificationService.showError('Error editing server');
          //TODO: handle error
        }
      },
      async deleteServer(name: string) {
        patchState(store, { isLoading: true });
        try {
          await serversService.deleteServer(name);
          patchState(store, {
            servers: store.servers().filter((server) => server.name !== name),
            isLoading: false
          });
        } catch (e) {
          patchState(store, { isLoading: false });
          notificationService.showError('Error deleting server');
          //TODO: handle error
        }
      },
      getServer() {},
    };
  })
);
