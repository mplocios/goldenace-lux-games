import { Game, Plugin } from "../WorldManager";
import { ClosedPlugin } from "./ClosedPlugin";
import { NewGamePlugin } from "./NewGamePlugin";
import { OpenPlugin } from "./OpenPlugin";
import { SelectedWinners } from "./SelectedWinners";


export class GameStatesPlugin implements Plugin {
	build(game: Game): void {
		game
      .addPlugin(new NewGamePlugin)
      .addPlugin(new OpenPlugin)
      .addPlugin(new ClosedPlugin)
      .addPlugin(new SelectedWinners)
	}
}
