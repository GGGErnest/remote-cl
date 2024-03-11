import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { ServersStore } from 'src/app/servers/data-access/servers-store';
import { NotificationService } from 'src/app/shared/data-access/notification.service';
import { TerminalConnectionManagerService } from './terminal-connection-manager.service';
import { TerminalsState } from './terminal-types';
import { TerminalsService } from './terminals.service';

const initialState: TerminalsState = {
  terminals: [],
  isLoading: false,
};

export const TerminalsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const serversStore = inject(ServersStore);
    const terminalsService = inject(TerminalsService);
    const notificationService = inject(NotificationService);
    const terminalConnectionManagerService = inject(
      TerminalConnectionManagerService
    );
    return {
      async create(serverName: string, terminalName: string) {
        patchState(store, { isLoading: true });
        try {
          const { result } = await terminalsService.create(
            serverName,
            terminalName
          );
          const terminalId = Object.keys(result)[0];
          terminalConnectionManagerService.init([terminalId]);
          const servers = serversStore.servers();
          const server = servers.find((server) => server.name === serverName);
          if (server) {
            server.runningShells = { ...server.runningShells, ...result };
            serversStore.editServer(server);
          }

          return terminalId;
        } catch (error) {
          patchState(store, { isLoading: false });
          notificationService.showError('Error creating terminal');
          return null;
        }
      },
      async stopTerminal(serverName: string, terminalId: string) {
        patchState(store, { isLoading: true });
        try {
          const server = serversStore
            .servers()
            .find((server) => server.name === serverName);
          await terminalsService.stopTerminal(server!, terminalId);
          delete server!.runningShells[terminalId];
          serversStore.editServer(server!);
        } catch (error) {
          patchState(store, { isLoading: false });
          notificationService.showError('Error stopping terminal');
        }
      },

      async getTerminalHistory(shellId: string) {
        patchState(store, { isLoading: true });
        try {
          const { result } = await terminalsService.getTerminalHistory(shellId);
          patchState(store, { isLoading: false });
          return result;
        } catch (error) {
          patchState(store, { isLoading: false });
          notificationService.showError('Error getting terminal history');
          return null;
        }
      },
    };
  })
);
