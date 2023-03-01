import { ServerEvents } from './ServerEvents';
import { CardStateDefinition } from '../common/types';

export type ServerPayloads = {
  [ServerEvents.LobbyState]: {
    lobbyId: string;
    variant: string;
    numSeats: number;
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
