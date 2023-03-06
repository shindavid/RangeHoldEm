import { Table } from '@app/game/table/table';
import { Server } from 'socket.io';
import { AuthenticatedSocket } from '@app/game/types';
import { ServerException } from '@app/game/server.exception';
import { SocketExceptions } from '@shared/server/SocketExceptions';
import { TABLE_MAX_LIFETIME } from '@app/game/constants';
import { ServerEvents } from '@shared/server/ServerEvents';
import { ServerPayloads } from '@shared/server/ServerPayloads';
import { TableMode } from '@app/game/table/types';
import { Cron } from '@nestjs/schedule';

export class TableManager
{
  public server: Server;

  private readonly lables: Map<Table['id'], Table> = new Map<Table['id'], Table>();

  public initializeSocket(client: AuthenticatedSocket): void
  {
    client.data.table = null;
  }

  public terminateSocket(client: AuthenticatedSocket): void
  {
    client.data.table?.removeClient(client);
  }

  public createTable(): Table
  {
    let maxClients = 1;

    const table = new Table(this.server, maxClients);

    this.lables.set(table.id, table);

    return table;
  }

  public joinTable(tableId: string, client: AuthenticatedSocket): void
  {
    const table = this.lables.get(tableId);

    if (!table) {
      throw new ServerException(SocketExceptions.TableError, 'Table not found');
    }

    if (table.clients.size >= table.maxClients) {
      throw new ServerException(SocketExceptions.TableError, 'Table already full');
    }

    table.addClient(client);
  }

  // Periodically clean up lables
  @Cron('*/5 * * * *')
  private lablesCleaner(): void
  {
    for (const [tableId, table] of this.lables) {
      const now = (new Date()).getTime();
      const tableCreatedAt = table.createdAt.getTime();
      const tableLifetime = now - tableCreatedAt;

      if (tableLifetime > TABLE_MAX_LIFETIME) {
        table.dispatchToTable<ServerPayloads[ServerEvents.GameMessage]>(ServerEvents.GameMessage, {
          color: 'blue',
          message: 'Game timed out',
        });

        table.instance.triggerFinish();

        this.lables.delete(table.id);
      }
    }
  }
}
