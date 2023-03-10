import { ClientEvents } from '@range-holdem/shared/client/ClientEvents';
import useSocketManager from '@hooks/useSocketManager';
import { useRecoilValue } from 'recoil';
import { CurrentTableState } from '@components/game/states';
import Card from '@components/game/Card';
import { Badge, LoadingOverlay, Overlay } from '@mantine/core';
import { MantineColor } from '@mantine/styles';
import { showNotification } from '@mantine/notifications';
import { emitEvent } from '@utils/analytics';

export default function Game() {
  const {sm} = useSocketManager();
  const currentTableState = useRecoilValue(CurrentTableState)!;
  const clientId = sm.getSocketId()!;
  let clientScore = 0;
  let opponentScore = 0;

  for (const scoreId in currentTableState.scores) {
    if (scoreId === clientId) {
      clientScore = currentTableState.scores[scoreId];
    } else {
      opponentScore = currentTableState.scores[scoreId];
    }
  }

  // Compute result
  let result: string;
  let resultColor: MantineColor;

  if (clientScore === opponentScore) {
    result = 'Draw, no one won!';
    resultColor = 'yellow';
  } else if (clientScore > opponentScore) {
    result = 'You won!';
    resultColor = 'blue';
  } else {
    result = 'You lost...';
    resultColor = 'red';
  }

  const onRevealCard = (cardIndex: number) => {
    sm.emit({
      event: ClientEvents.GameRevealCard,
      data: {cardIndex},
    });

    emitEvent('card_revealed');
  };

  const onReplay = () => {
    sm.emit({
      event: ClientEvents.TableCreate,
      data: {
        numSeats: currentTableState.numSeats,
        variant: currentTableState.variant,
      },
    });

    emitEvent('table_create');
  };

  const copyTableLink = async () => {
    const link = `${window.location.origin}?table=${currentTableState.tableId}`;
    await navigator.clipboard.writeText(link);

    showNotification({
      message: 'Link copied to clipboard!',
      color: 'green',
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center my-5">
        <Badge size="xl">Variant: {currentTableState.variant}</Badge>
        <Badge size="xl">Num Seats: {currentTableState.numSeats}</Badge>
      </div>
      <div className="flex justify-between items-center my-5">
        <Badge size="xl">Your score: {clientScore}</Badge>
        <Badge variant="outline">
          {!currentTableState.hasStarted
            ? (<span>Waiting for opponent...</span>)
            : (<span>Round {currentTableState.currentRound}</span>)
          }
        </Badge>

        {false && <Badge size="xl" color="red">Opponent score: {opponentScore}</Badge>}
      </div>

      {currentTableState.isSuspended && (
        <div className="text-center text-lg">
          Next round starting soon, remember cards !
        </div>
      )}

      <div className="grid grid-cols-7 gap-4 relative select-none">
        {currentTableState.hasFinished && <Overlay opacity={0.6} color="#000" blur={2} zIndex={5}/>}
        <LoadingOverlay visible={!currentTableState.hasStarted || currentTableState.isSuspended}/>

        {currentTableState.cards.map((card, i) => (
          <div
            key={i}
            className="col-span-1"
          >
            <Card
              card={card}
              cardIndex={i}
              onRevealCard={onRevealCard}
              clientId={clientId}
            />
          </div>
        ))}
      </div>

      {currentTableState.hasFinished && (
        <div className="text-center mt-5 flex flex-col">
          <Badge size="xl" color={resultColor} className="self-center">{result}</Badge>
          <button className="mt-3 self-center" onClick={onReplay}>Play again ?</button>
        </div>
      )}

      {!currentTableState.hasStarted && (
        <div className="text-center mt-5">
          <button className="btn" onClick={copyTableLink}>Copy table link</button>
        </div>
      )}
    </div>
  );
}
