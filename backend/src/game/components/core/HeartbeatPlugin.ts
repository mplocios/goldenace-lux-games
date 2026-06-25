import { WebSocket } from "ws";
import { SocketPlugin } from "./SocketPlugin";
import { Game, Plugin } from "./WorldManager";

const INTERVAL = 60.0;

export class HeartbeatPlugin implements Plugin {
	build(game: Game): void {
		game
			.system(update)
	}
}

function update(game: Game) {
	game
		.view(HeartBeat, Game.wsType)
		.each((entity, heartBeat, socket) => {
      if (heartBeat.duration >= INTERVAL) {
        heartBeat.duration -= INTERVAL ;

        socket.send(JSON.stringify({
          channel: "/HeartBeat",
          data: {}
        }))
      }
      heartBeat.duration += game.delta;
		});
}


export class HeartBeat {
  duration: number = 0.0
  constructor() {
    this.duration = 0.0
  }
}
