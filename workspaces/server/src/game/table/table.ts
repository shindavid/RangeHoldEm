import { v4 } from 'uuid';
import { Server, Socket } from 'socket.io';
import { ServerEvents } from '@shared/server/ServerEvents';
import { AuthenticatedSocket } from '@app/game/types';
import { Instance } from '@app/game/instance/instance';
import { ServerPayloads } from '@shared/server/ServerPayloads';

export class Table
{
  public readonly id: string = v4();

  public readonly createdAt: Date = new Date();

  public readonly clients: Map<Socket['id'], AuthenticatedSocket> = new Map<Socket['id'], AuthenticatedSocket>();

  public readonly instance: Instance = new Instance(this);

  constructor(
    private readonly server: Server,
    public readonly maxClients: number,
  )
  {
  }

  public addClient(client: AuthenticatedSocket): void
  {
    this.clients.set(client.id, client);
    client.join(this.id);
    client.data.table = this;

    if (this.clients.size >= this.maxClients) {
      this.instance.triggerStart();
    }

    this.dispatchTableState();
  }

  public removeClient(client: AuthenticatedSocket): void
  {
    this.clients.delete(client.id);
    client.leave(this.id);
    client.data.table = null;

    // If player leave then the game isn't worth to play anymore
    this.instance.triggerFinish();

    // Alert the remaining player that client left table
    this.dispatchToTable<ServerPayloads[ServerEvents.GameMessage]>(ServerEvents.GameMessage, {
      color: 'blue',
      message: 'Opponent left table',
    });

    this.dispatchTableState();
  }

  public dispatchTableState(): void
  {
    const payload: ServerPayloads[ServerEvents.TableState] = {
      tableId: this.id,
      variant: this.instance.variant,
      numSeats: this.instance.numSeats,
      bigBlind: this.instance.bigBlind,
      stackSizeBB: this.instance.stackSizeBB,
      hasStarted: this.instance.hasStarted,
      hasFinished: this.instance.hasFinished,
      currentRound: this.instance.currentRound,
      playersCount: this.clients.size,
      cards: this.instance.cards.map(card => card.toDefinition()),
      isSuspended: this.instance.isSuspended,
      scores: this.instance.scores,
    };

    this.dispatchToTable(ServerEvents.TableState, payload);
  }

  public dispatchToTable<T>(event: ServerEvents, payload: T): void
  {
    this.server.to(this.id).emit(event, payload);
  }
}
