import useSocketManager from '@hooks/useSocketManager';
import { useEffect } from 'react';
import { Listener } from '@components/websocket/types';
import { ServerEvents } from '@range-holdem/shared/server/ServerEvents';
import { ServerPayloads } from '@range-holdem/shared/server/ServerPayloads';
import { useRecoilState } from 'recoil';
import { CurrentTableState } from '@components/game/states';
import Introduction from '@components/game/Introduction';
import Game from '@components/game/Game';
import { useRouter } from 'next/router';
import { showNotification } from '@mantine/notifications';

export default function GameManager() {
  const router = useRouter();
  const {sm} = useSocketManager();
  const [tableState, setTableState] = useRecoilState(CurrentTableState);

  useEffect(() => {
    sm.connect();

    const onTableState: Listener<ServerPayloads[ServerEvents.TableState]> = async (data) => {
      setTableState(data);

      router.query.table = data.tableId;

      await router.push({
        pathname: '/',
        query: {...router.query},
      }, undefined, {});
    };

    const onGameMessage: Listener<ServerPayloads[ServerEvents.GameMessage]> = ({color, message}) => {
      showNotification({
        message: message,
        color: color,
        autoClose: 2000,
      });
    };

    sm.registerListener(ServerEvents.TableState, onTableState);
    sm.registerListener(ServerEvents.GameMessage, onGameMessage);

    return () => {
      sm.removeListener(ServerEvents.TableState, onTableState);
      sm.removeListener(ServerEvents.GameMessage, onGameMessage);
    };
  }, []);

  if (tableState === null) {
    return <Introduction/>;
  }

  return <Game/>;
}