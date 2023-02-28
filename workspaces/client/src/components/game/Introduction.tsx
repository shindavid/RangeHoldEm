import useSocketManager from '@hooks/useSocketManager';
import { ClientEvents } from '@range-holdem/shared/client/ClientEvents';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { emitEvent } from '@utils/analytics';
import { Divider, Select } from '@mantine/core';

export default function Introduction() {
  const router = useRouter();
  const {sm} = useSocketManager();
  const [gameVariant, setGameVariant] = useState('FLHE');

  useEffect(() => {
    if (router.query.lobby) {
      sm.emit({
        event: ClientEvents.LobbyJoin,
        data: {
          lobbyId: router.query.lobby,
        },
      });
    }
  }, [router]);

  const onCreateLobby = () => {
    sm.emit({
      event: ClientEvents.LobbyCreate,
      data: {
        mode: mode,
        gameVariant: gameVariant,
      },
    });

    emitEvent('lobby_create');
  };

  return (
    <div className="mt-4">
      <p className="mt-3 text-lg">
        You are about to play a special variant of Texas Hold&apos;em.<br/>
        Instead of getting dealt two specific cards, you will play with <i>all</i> possible two-card combinations <i>simultaneously</i>.<br/>
        At each action point, the dealer will accept as input your actions for your entire range, and randomly sample your action based on it.<br/>
        At the end of each hand, the dealer awards you your share of the pot based on the entire range of hands you (and your opponent) have.
      </p>

      <Divider my="md"/>

      <div>
        <h3 className="text-xl">Game options</h3>

        <Select
          label="Game Variant"
          defaultValue="FLHE"
          onChange={(variant) => setGameVariant(variant)}
          data={[
            {value: 'FLHE', label: 'Fixed-Limit Holdem'},
            {value: 'NLHE-100', label: 'No-Limit Holdem, 100BB stacks (not yet supported)', disabled: true},
          ]}
        />
      </div>

      <div className="mt-5 text-center flex justify-between">
        <button className="btn" onClick={() => onCreateLobby()}>Begin</button>
      </div>
    </div>
  );
}
