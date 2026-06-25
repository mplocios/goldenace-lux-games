import { GameStatesPlugin } from "./gamestates/GameStatesPlugin";
import { HeartbeatPlugin } from "./HeartbeatPlugin";
import { HostPlugin } from "./HostPlugin";
import { PlayerPlugin } from "./PlayerPlugin";
import { RedundantUserPlugin } from "./RedundantUserPlugin";
import { SocketPlugin } from "./SocketPlugin";
import { UserPlugin } from "./UserPlugin";
import { Game, Plugin } from "./WorldManager";

export class CorePlugin implements Plugin {

	build(game: Game): void {
    game
      .addPlugin(new UserPlugin)
      .addPlugin(new SocketPlugin)
      .addPlugin(new HostPlugin)
      .addPlugin(new PlayerPlugin)
      .addPlugin(new RedundantUserPlugin)
      .addPlugin(new GameStatesPlugin)
      .addPlugin(new HeartbeatPlugin)
	}
}
