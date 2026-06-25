
import { BoatRacePlugin } from "../boatrace/BoatRacePlugin";
import { GameStatesPlugin } from "../core/gamestates/GameStatesPlugin";
import { HeartbeatPlugin } from "../core/HeartbeatPlugin";
import { PlayerPlugin } from "../core/PlayerPlugin";
import { RedundantUserPlugin } from "../core/RedundantUserPlugin";
import { UserPlugin } from "../core/UserPlugin";
import { Game, Plugin } from "../core/WorldManager";
import { OnClosedPlugin } from "./OnClosedPlugin";
import { StarterPlugin } from "./StarterPlugin";
import { SocketPlugin } from "./SocketPlugin";
import { OnSelectedWinnersPlugin } from "./OnSelectedWinnersPlugin";

export class AutomationPlugin implements Plugin {
  build(game: Game): void {
    const data = new AutoData()
    data.playTimer = Number(process.env.PLAY_TIMER || 5)
    data.newRoundTimer = Number(process.env.NEWROUND_TIMER || 5)

		game
      .addPlugin(new UserPlugin)
      .addPlugin(new SocketPlugin)
      .addPlugin(new PlayerPlugin)
      .addPlugin(new RedundantUserPlugin)
      .addPlugin(new GameStatesPlugin)
      .addPlugin(new HeartbeatPlugin)
      .addPlugin(new BoatRacePlugin)
      .addPlugin(new StarterPlugin)
      .addPlugin(new OnClosedPlugin)
      .addPlugin(new OnSelectedWinnersPlugin)
      .global.set("AutoData", data)
	}
	
}

export class AutoData {
  isPlaying = false
  isSelectWinnerTimerPlaying = false

  playTimer: number
  newRoundTimer: number
}