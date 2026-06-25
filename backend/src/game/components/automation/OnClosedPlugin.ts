import { Channels, GameEvent, GameState } from "../../../utils/common";
import { Interval } from "../common/Utils";
import { Event, Game, GameData, Plugin } from "../core/WorldManager";
import { AutoData } from "./Automation";
import { PlayerManager } from "../../HorseraceManager";

/** Auto transitioning from Closed State to SelectedWinners state with timer */
export class OnClosedPlugin implements Plugin {
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
    handleClosed(game, e)
  })
}

function handleClosed(game: Game, e: Event) {
  let gameData: GameData = game.global.get("GameData")
  const adjustTime = 10
  if (
    gameData.state === GameState.Closed &&
    e.msg.data.state === GameState.Closed
  ) {

    let auto: AutoData = game.global.get("AutoData")
    let spawnTimer = true
    game.view(PlayTimerTag).each((entity, tag) => {
      spawnTimer = false
    })
    const playerManager = PlayerManager.getInstance()
    const fastestHorse = playerManager.getFastest()
    auto.playTimer = Math.ceil(fastestHorse) + adjustTime // adjust to set when to finish the race

    if (spawnTimer) {
      game.create(
        new Interval(1.0, auto.playTimer),
        new PlayTimerTag()
      )
    }
  }
}

function processTimer(game: Game) {
  game.view(Interval, PlayTimerTag).each((entity, interval, tag) => {
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
      const playerManager = PlayerManager.getInstance()
      const horseWinner = playerManager.getHorseWinner()
      const winners = [`${horseWinner}`]  
      game.fireEvent(
        new Event(GameEvent.ChangeState, 
        {
          channel: Channels.ChangeState,
          data: {state: GameState.SelectedWinners, winners}
        })
      )
    }
  });
}

class PlayTimerTag { }