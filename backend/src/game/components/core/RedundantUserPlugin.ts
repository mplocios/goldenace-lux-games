import { Entity } from "uecs";
import { User, UserTag } from "./UserPlugin";
import { Game, Plugin } from "./WorldManager";

/**
 * Websocket are always called twice, so we have to dispose the last one and replace with new one,
 * As websocket is updated to the last one
 */
export class RedundantUserPlugin implements Plugin {
	build(game: Game): void {
		game
			.system(removeOldUser)
	}
}

function removeOldUser(game: Game) {
	game
		.view(User, UserTag)
		.each((currentEntity: Entity, newUser, tag) => {
      // console.log("tag", newUser.id)

      game
		    .view(User)
        .each((entity :Entity, currentUser) => {
          if (currentEntity !== entity && currentUser.id === newUser.id) {
            game.destroy(entity);

            // console.log("Removed", newUser.id)
          }
        })
		});
}

export class RedundantUserTag {
  id = 0;
  constructor(id) {
    this.id = id;
  }
}