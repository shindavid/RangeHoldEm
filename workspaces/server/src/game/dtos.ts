import { IsInt, IsNumber, IsString, Max, Min } from 'class-validator';
import { Cards } from '@shared/common/Cards';

export class LobbyCreateDto
{
  @IsString()
  variant: 'FLHE';

  @IsInt()
  @Min(2)
  @Max(9)
  numSeats: number;
}

export class LobbyJoinDto
{
  @IsString()
  lobbyId: string;
}

export class RevealCardDto
{
  @IsNumber()
  cardIndex: Cards;
}
