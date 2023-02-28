import { atom } from 'recoil';
import { ServerPayloads } from '@range-holdem/shared/server/ServerPayloads';
import { ServerEvents } from '@range-holdem/shared/server/ServerEvents';

export const CurrentLobbyState = atom<ServerPayloads[ServerEvents.LobbyState] | null>({
  key: 'CurrentLobbyState',
  default: null,
});