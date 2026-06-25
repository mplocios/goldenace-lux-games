import { Entity } from "uecs";
import { Game, Input, Plugin } from "./WorldManager";

export class SocketPlugin implements Plugin {
	build(game: Game): void {
		game
			.before(removeInputs)
			.before(transferInputs)
			.before(this.before)
	}
	before(game: Game) {
		game.view(Game.wsType)
			.each((entity: Entity, socket: any) => {
				if (!socket.isLoaded) {
					socket.isLoaded = true;

					// This can be triggered anytime, so we need AddInput interface to make sure
					// That the Input is always added before all systems are called
					socket.on("message", (message: any) => {
            // console.log(JSON.parse(message))
            try {
              game.insert(entity, new AddInput(JSON.parse(message)))
            } catch (e) {
              // console.log(e)
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

export class AddInput {
	message: any
	constructor(msg: any) {
		this.message = msg
	}
}