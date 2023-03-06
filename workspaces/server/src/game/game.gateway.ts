import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WsResponse,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ClientEvents } from '@shared/client/ClientEvents';
import { ServerEvents } from '@shared/server/ServerEvents';
import { TableManager } from '@app/game/table/table.manager';
import { Logger, UsePipes } from '@nestjs/common';
import { AuthenticatedSocket } from '@app/game/types';
import { ServerException } from '@app/game/server.exception';
import { SocketExceptions } from '@shared/server/SocketExceptions';
import { ServerPayloads } from '@shared/server/ServerPayloads';
import { TableCreateDto, TableJoinDto, RevealCardDto } from '@app/game/dtos';
import { WsValidationPipe } from '@app/websocket/ws.validation-pipe';

@UsePipes(new WsValidationPipe())
@WebSocketGateway()
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger: Logger = new Logger(GameGateway.name);

  constructor(
    private readonly tableManager: TableManager,
  )
  {
  }

  afterInit(server: Server): any
  {
    // Pass server instance to managers
    this.tableManager.server = server;

    this.logger.log('Game server initialized !');
  }

  async handleConnection(client: Socket, ...args: any[]): Promise<void>
  {
    // Call initializers to set up socket
    this.tableManager.initializeSocket(client as AuthenticatedSocket);
  }

  async handleDisconnect(client: AuthenticatedSocket): Promise<void>
  {
    // Handle termination of socket
    this.tableManager.terminateSocket(client);
  }

  @SubscribeMessage(ClientEvents.Ping)
  onPing(client: AuthenticatedSocket): void
  {
    client.emit(ServerEvents.Pong, {
      message: 'pong',
    });
  }

  @SubscribeMessage(ClientEvents.TableCreate)
  onTableCreate(client: AuthenticatedSocket, data: TableCreateDto): WsResponse<ServerPayloads[ServerEvents.GameMessage]>
  {
    // TODO: use data.variant, data.numSeats
    const table = this.tableManager.createTable();
    table.addClient(client);

    return {
      event: ServerEvents.GameMessage,
      data: {
        color: 'green',
        message: 'Table created',
      },
    };
  }

  @SubscribeMessage(ClientEvents.TableJoin)
  onTableJoin(client: AuthenticatedSocket, data: TableJoinDto): void
  {
    this.tableManager.joinTable(data.tableId, client);
  }

  @SubscribeMessage(ClientEvents.TableLeave)
  onTableLeave(client: AuthenticatedSocket): void
  {
    client.data.table?.removeClient(client);
  }

  @SubscribeMessage(ClientEvents.GameRevealCard)
  onRevealCard(client: AuthenticatedSocket, data: RevealCardDto): void
  {
    if (!client.data.table) {
      throw new ServerException(SocketExceptions.TableError, 'You are not in a table');
    }

    client.data.table.instance.revealCard(data.cardIndex, client);
  }
}