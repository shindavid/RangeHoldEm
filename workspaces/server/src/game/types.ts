import { Socket } from 'socket.io';
import { Table } from '@app/game/table/table';
import { ServerEvents } from '@shared/server/ServerEvents';

export type AuthenticatedSocket = Socket & {
  data: {
    table: null | Table;
  };

  emit: <T>(ev: ServerEvents, data: T) => boolean;
};