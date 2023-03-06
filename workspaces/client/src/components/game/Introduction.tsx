import useSocketManager from '@hooks/useSocketManager';
import { ClientEvents } from '@range-holdem/shared/client/ClientEvents';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { emitEvent } from '@utils/analytics';
import { createStyles, Divider, NumberInput, Select, SimpleGrid } from '@mantine/core';

export default function Introduction() {
  const router = useRouter();
  const {sm} = useSocketManager();
  const [bigBlind, setBigBlind] = useState<number>(10);
  const [stackSizeBB, setStackSizeBB] = useState<number>(100);
  const [numSeats, setNumSeats] = useState<number>(2);
  const [variant, setVariant] = useState<string>('FLHE');

  useEffect(() => {
    if (router.query.table) {
      sm.emit({
        event: ClientEvents.TableJoin,
        data: {
          tableId: router.query.table,
        },
      });
    }
  }, [router]);

  const onCreateTable = () => {
    sm.emit({
      event: ClientEvents.TableCreate,
      data: {
        numSeats: numSeats,
        variant: variant,
        bigBlind: bigBlind,
        stackSizeBB: stackSizeBB,
      },
    });

    emitEvent('table_create');
  };

  const useStyles = createStyles((theme) => ({
    invalid: {
      backgroundColor:
        theme.colorScheme === 'dark' ? theme.fn.rgba(theme.colors.red[8], 0.15) : theme.colors.red[0],
    },

    icon: {
      color: theme.colors.red[theme.colorScheme === 'dark' ? 7 : 6],
    },
  }));

  const { classes } = useStyles();
  const gridBreakpoints = [{ maxWidth: 'md', cols: 2 }, { maxWidth: 'sm', cols: 1 }];

  return (
    <div className="mt-4">
      <p className="mt-3 text-lg">
        You are about to play a special variant of Texas Hold&apos;em.<br/><br/>
        Instead of getting dealt two specific cards, you will play with <i>all</i> possible two-card combinations <i>simultaneously</i>.<br/><br/>
        At each action point, the dealer will accept as input your actions for your entire range, and randomly sample your action based on it.<br/><br/>
        At the end of each hand, the dealer awards you your share of the pot based on the entire range of hands you (and your opponent) have.
      </p>

      <Divider my="md"/>

      <div>
        <h3 className="text-xl">Game options</h3>
        <br/>

        <SimpleGrid cols={2} breakpoints={gridBreakpoints}>
          <NumberInput
            mt="sm"
            label="Big Blind"
            defaultValue={10}
            min={2}
            max={1000}
            step={2}
            onChange={(value) => setBigBlind(+value!)}
          />

          <NumberInput
            mt="sm"
            label="Stack Size in BB"
            defaultValue={100}
            min={1}
            max={10000}
            step={1}
            onChange={(value) => setStackSizeBB(+value!)}
          />

          <Select
            label="Num Seats"
            defaultValue="2"
            onChange={(numSeats) => setNumSeats(+numSeats!)}
            data={[
              {value: '2', label: '2'},
              {value: '6', label: '6 (not yet supported)', disabled: true},
              {value: '9', label: '9 (not yet supported)', disabled: true},
            ]}
          />

          <Select
            label="Game Variant"
            defaultValue="FLHE"
            onChange={(variant) => setVariant(variant!)}
            data={[
              {value: 'FLHE', label: 'Fixed-Limit Holdem'},
              {value: 'NLHE', label: 'No-Limit Holdem (not yet supported)', disabled: true},
            ]}
          />
        </SimpleGrid>
      </div>

      <div className="mt-5 text-center flex justify-between">
        <button className="btn" onClick={() => onCreateTable()}>Begin</button>
      </div>
    </div>
  );
}
