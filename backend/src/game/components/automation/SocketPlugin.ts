import { Entity } from "uecs";
import { Game, Input, Plugin } from "../core/WorldManager"
import WebSocket from 'ws';
import { AutoChannel } from "./StarterPlugin";

type ClassType<T> = new (...args: any[]) => T;

export class SocketPlugin implements Plugin {
  public static classType: ClassType<any>;

  static setClassType<T>(classType: ClassType<T>) {
    Game.wsType = classType;	
  }

	build(game: Game): void {
    SocketPlugin.setClassType(WebSocket)

		game
			.before(removeInputs)
			.before(transferInputs)
			.before(this.before)
	}
	before(game: Game) {
    // console.log(Game.wsType)
    // console.log("testing")
		game.view(Game.wsType)
			.each((entity: Entity, socket: any) => {
				if (!socket.isLoaded) {
					socket.isLoaded = true;

					// This can be triggered anytime, so we need AddInput interface to make sure
					// That the Input is always added before all systems are called
					socket.on("message", (message: any) => {
            const msg = JSON.parse(message)
            console.log(msg)

            if (msg.channel === AutoChannel.Start) {
              game.paused = false

              if (socket.firstTimeStart) {
                return
              }
              if (!socket.firstTimeStart) {
                socket.firstTimeStart = true
              }
            }

            if (msg.channel === AutoChannel.Stop) {
              game.paused = true
              return
            }

            try {
              game.insert(entity, new AddInput(msg))
            } catch (e) {
              console.log(e)
              console.log("Error receiving message")
            }
          })
				}
			});
	}
}

function removeInputs(game: Game) {
	game.view(Game.wsType, Input)
		.each((entity: Entity, input) => {
			game.remove(entity, Input);
		});

}

function transferInputs(game: Game) {
	game.view(AddInput)
		.each((entity: Entity, addInput) => {
			game.insert(entity, new Input(addInput.message))
			game.remove(entity, AddInput)
		});
}

class AddInput {
	message: any
	constructor(msg: any) {
		this.message = msg
	}
}
