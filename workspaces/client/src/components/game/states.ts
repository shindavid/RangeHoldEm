import { atom } from 'recoil';
import { ServerPayloads } from '@range-holdem/shared/server/ServerPayloads';
import { ServerEvents } from '@range-holdem/shared/server/ServerEvents';

export const CurrentTableState = atom<ServerPayloads[ServerEvents.TableState] | null>({
  key: 'CurrentTableState',
  default: null,
});