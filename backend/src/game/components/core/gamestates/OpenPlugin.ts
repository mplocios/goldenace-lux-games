import { Channels, GameEvent, GameState } from "../../../../utils/common";
import { Event, Game, GameData, Plugin } from "../WorldManager";
import GameRound from "../../../../../models/GameRound";
import { SocketPlugin } from "../SocketPlugin";
import { PlayerManager } from "../../../HorseraceManager";
import PlayerChain from "../../service/Player";
import moment from "moment";

export class OpenPlugin implements Plugin {
	build(game: Game): void {
		game
			.system(update)
      .system(updateTimerToClose);
	}
}

function update(game: Game) {
  game.events.forEach(async(e) => {
    if (e.type === GameEvent.ChangeState) {
      let gameData: GameData = game.global.get("GameData")
      if (
        gameData.state === GameState.NewGame &&
        e.msg.data.state === GameState.Open
      ) {
        gameData.state = GameState.Open

        const playerManager = PlayerManager.getInstance()
        playerManager.setHorseGameState(GameState.Open)
        const playerChains = await PlayerChain({ playerCount: 4 });  //sending players speed
        playerManager.addPlayerChain(playerChains)


        game.fireEvent(new Event(GameEvent.Broadcast, {
          channel: Channels.ChangeState,
          data: {
            state: GameState.Open,
            playerChain: playerChains,
          },
        }))

        // game.create(new Timer(gameData.countDown))
        game.create(new Interval(1.0, gameData.countDown), new OpenTimerTag())
      }
    }
  })
}



function updateTimerToClose(game: Game) {
  game.view(Interval, OpenTimerTag).each((entity, interval, tag) => {
    if (interval.isCalled(game.delta)) {
 
      game.fireEvent(new Event(GameEvent.Broadcast, {
        channel: Channels.Game,
        data: {
          countDown: interval.repeat
        }
      }))
    }

    if (interval.isDone()) {
      game.destroy(entity)

      game.fireEvent(new Event(GameEvent.ChangeState, {
        channel: Channels.ChangeState,
        data: {state: GameState.Closed}
      }))
    }
  });
}

class Timer {
  time: number
  constructor(time: number) {
    this.time = time
  }

  isDone(delta: number) {
    if (this.time <= 0.0) {
      return true
    }
    this.time -= delta
    return false
  }
}

class Interval {
  interval: number
  repeat: number
  duration: number = 0.0

  constructor(interval: number, repeat: number) {
    this.interval = interval
    this.repeat = repeat
  }

  isCalled(delta: number): boolean {
    if (this.duration >= this.interval) {
      this.duration -= this.interval
      this.repeat -= 1
      return true
    } else {
      this.duration += delta
    }
    return false
  }

  isDone(): boolean {
    return this.repeat <= 0
  }
}

class OpenTimerTag {}
