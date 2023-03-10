import { ServerEvents } from './ServerEvents';
import { CardStateDefinition } from '../common/types';

export type ServerPayloads = {
  [ServerEvents.TableState]: {
    tableId: string;
    variant: string;
    numSeats: number;
    bigBlind: number;
    stackSizeBB: number;
    hasStarted: boolean;
    hasFinished: boolean;
    currentRound: number;
    playersCount: number;
    cards: CardStateDefinition[];
    isSuspended: boolean;
    scores: Record<string, number>;
  };

  [ServerEvents.GameMessage]: {
    message: string;
    color?: 'green' | 'red' | 'blue' | 'orange';
  };
};
