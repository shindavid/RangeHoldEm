import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { TableManager } from '@app/game/table/table.manager';

@Module({
  providers: [
    // Gateways
    GameGateway,

    // Managers
    TableManager,
  ],
})
export class GameModule
{
}
