import { Game, Plugin } from "./WorldManager";
import { HeartBeat } from "./HeartbeatPlugin";


export class UserPlugin implements Plugin {
	build(game: Game): void {
		game
      .after(removeUserTags);
	}
}


function removeUserTags(game: Game) {
  game.view(UserTag).each((entity, tag) => {
    game.remove(entity, UserTag)
  });
}


export class User {
	id = 0;
	payload: Payload
	constructor(id, payload: Payload) {
    this.id = id
		this.payload = payload;
	}

}

export class Payload {
  id: number
  mobile_number: string
  name: string
  type: string

  constructor(id: number, mobile_number: string, name: string, type: string) {
    this.id
    this.mobile_number = mobile_number
    this.name = name
    this.type = type
  }
}

export class UserTag { }

