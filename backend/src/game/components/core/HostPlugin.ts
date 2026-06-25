import { Entity } from "uecs";
import { SocketPlugin } from "./SocketPlugin";
import { Event, Game, GameData, Input, Plugin } from "./WorldManager";
import { Channels, GameEvent, GameState } from "../../../utils/common";
import { User, UserTag } from "./UserPlugin";


export class HostPlugin implements Plugin {

	build(game: Game): void {
		game
      .system(create)
			.system(this.init)
			.system(this.update)
	}

	init(game: Game) {
		game
      .view(Host, Input, Game.wsType)
      .each((entity, host, input, socket) => {
        const json = input.json
        if (json.channel !== Channels.Init) {
          return;
        }

        let gameData: GameData = game.global.get("GameData")
        socket.send(JSON.stringify({
          channel: Channels.Init,
          data: {
            state: gameData.state
          }
        }))
		  });
	}

	update(game: Game) {
		game.view(Host, Input).each((entity, host, input) => {
      const json = input.json
      if (json.channel !== Channels.ChangeState) {
        return;
      }

      game.fireEvent(new Event(GameEvent.ChangeState, json))
		});
	}
}

function create(game: Game) {
  game.view(User, UserTag).each((entity, user, tag) => {
    if (user.payload.type !== 'host') {
      return;
    }

    game.insert(entity, Host)
  });
}

export class Host {
  id = 0;
  constructor(id) {
    this.id = id;
  }
}

export class HostInit {}

export class SelectWinnerTag {}
