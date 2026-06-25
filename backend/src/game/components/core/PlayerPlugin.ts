import { Entity } from "uecs";
import { Game, GameData, Input, Plugin } from "./WorldManager";
import { User, UserTag } from "./UserPlugin";
import { SocketPlugin } from "./SocketPlugin";
import { Channels, GameEvent, GameState } from "../../../utils/common";

export class PlayerPlugin implements Plugin {
  build(game: Game): void {
    game
      .system(create)
      // .system(selectedWinners)
  }
}

function create(game: Game) {
  game
    .view(User, UserTag, Game.wsType)
    .each((entity, user, tag, socket) => {
      if (user.payload.type !== 'player') {
        return false;
      }

      game.insert(entity, Player)

      let gameData: GameData = game.global.get("GameData")

      socket.send(JSON.stringify({
        channel: Channels.ChangeState,
        data: {
          state: gameData.state
        }
      }))
  });
}

function selectedWinners(game: Game) {
  game.events.forEach((e) => {
    if (e.type !== GameEvent.Finalized) {
      return
    }

    game.view(Player, Game.wsType).each((entity, host, socket) => {
      socket.send(JSON.stringify({
        channel: Channels.ChangeState,
        data: {state: GameState.SelectedWinners}
      }))
    });
  })
}

export class Player { }

export class PlayerInit { }
