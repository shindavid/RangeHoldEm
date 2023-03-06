import { IsDivisibleBy, IsInt, IsNumber, IsString, Max, Min } from 'class-validator';
import { Cards } from '@shared/common/Cards';

export class TableCreateDto
{
  @IsString()
  variant: 'FLHE';

  @IsInt()
  @Min(2)
  @Max(9)
  numSeats: number;

  @IsInt()
  @Min(2)
  @Max(1000)
  @IsDivisibleBy(2)
  bigBlind: number;

  @IsInt()
  @Min(1)
  @Max(10000)
  stackSizeBB: number;
}

export class TableJoinDto
{
  @IsString()
  tableId: string;
}

export class RevealCardDto
{
  @IsNumber()
  cardIndex: Cards;
}
