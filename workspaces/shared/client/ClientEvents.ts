export enum ClientEvents
{
  // General
  Ping = 'client.ping',

  // Table
  TableCreate = 'client.table.create',
  TableJoin = 'client.table.join',
  TableLeave = 'client.table.leave',

  // Game
  GameRevealCard = 'client.game.reveal_card',
}
