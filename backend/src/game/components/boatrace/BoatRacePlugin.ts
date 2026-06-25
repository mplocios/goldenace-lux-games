import { Game, Plugin } from "../core/WorldManager";
import { BetPlugin } from "./BetPlugin";
import { PrizePlugin } from "./PrizePlugin";
import { ReplyPlugin } from "./ReplyPlugin";
import { WalletPlugin } from "./WalletPlugin";

export class BoatRacePlugin implements Plugin {
	build(game: Game): void {
    game
      .addPlugin(new BetPlugin)
      .addPlugin(new WalletPlugin)
      .addPlugin(new PrizePlugin)
      .addPlugin(new ReplyPlugin)
	}
}
