import { Channels, GameEvent, GameState } from "../../../utils/common";
import { Interval } from "../common/Utils";
import { Event, Game, GameData, Plugin } from "../core/WorldManager";
import { AutoData } from "./Automation";

/** Auto transitioning from SelectedWinners State to NewGame state with timer */
export class OnSelectedWinnersPlugin implements Plugin {
  build(game: Game): void {
    game
      .system(broadcastEvent)
      .system(processTimer)
	}
	
}

function broadcastEvent(game: Game) {
  game.events.forEach((e) => {
    if (e.type !== GameEvent.Broadcast) {
      return
    }

    activateTimerToNewGame(game, e)
  })
}

function activateTimerToNewGame(game: Game, e: Event) {
  let gameData: GameData = game.global.get("GameData")
  if (
    gameData.state === GameState.SelectedWinners &&
    e.msg.data.state === GameState.SelectedWinners
  ) {

    let auto: AutoData = game.global.get("AutoData")
    let spawnTimer = true
    game.view(TimerTag).each((entity, tag) => {
      spawnTimer = false
    })

    auto.playTimer = 10
    if (spawnTimer) {
      game.create(
        new Interval(1.0, auto.playTimer),
        new TimerTag()
      )
    }
  }
}

function processTimer(game: Game) {
  game.view(Interval, TimerTag).each((entity, interval, tag) => {
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
      game.fireEvent(
        new Event(GameEvent.ChangeState, 
        {
          channel: Channels.ChangeState,
          data: {state: GameState.NewGame}
        })
      )
    }
  });
}

class TimerTag { }