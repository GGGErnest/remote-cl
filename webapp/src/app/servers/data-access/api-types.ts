import { ServerResponse } from 'src/app/shared/data-access/models/api-types';
import { Server } from './server-types';

export interface ServersResponse extends ServerResponse {
  result: Server[];
}
