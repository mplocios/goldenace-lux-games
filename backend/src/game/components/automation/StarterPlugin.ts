import { Event, Game, GameData, Input, Plugin } from "../core/WorldManager";
import { SocketPlugin } from "../core/SocketPlugin";
import { Channels, GameEvent, GameState } from "../../../utils/common";
import { User, UserTag } from "../core/UserPlugin";
import { AutoData } from "./Automation";
import { Interval } from "../common/Utils";

/** Starter, will only be triggered once */
export class StarterPlugin implements Plugin {

	build(game: Game): void {
		game
      .system(create)
			.system(init)
			.system(start)
      .system(broadcastEvent)
	}
}

function create(game: Game) {
  game.view(User, UserTag).each((entity, user, tag) => {
    if (user.payload.type !== 'host') {
      return;
    }

    game.insert(entity, Host)
  });
}

function init(game: Game) {
  game
    .view(Host, Input, Game.wsType)
    .each((entity, host, input, socket) => {
      const json = input.json
      if (json.channel !== Channels.Init) {
        return;
      }

      let gameData: GameData = game.global.get("GameData")
      socket.send(JSON.stringify({
        channel: Channels.Init,
        data: {
          state: gameData.state
        }
      }))
    });
}

function start(game: Game) {
  game.view(Host, Input).each((entity, host, input) => {
    const json = input.json
    if (json.channel !== AutoChannel.Start) {
      return;
    }
    let auto: AutoData = game.global.get("AutoData")
    if (auto.isPlaying) {
      return
    }
    auto.isPlaying = true

    console.log("start")

    let gameData: GameData = game.global.get("GameData")
    if (gameData.state === GameState.Idle) {
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

function broadcastEvent(game: Game) {
  game.events.forEach((e) => {
    if (e.type !== GameEvent.Broadcast) {
      return
    }

    handleNewGame(game, e)
  })
}

function handleNewGame(game: Game, e: Event) {
  let gameData: GameData = game.global.get("GameData")
  if (
    gameData.state === GameState.NewGame &&
    e.msg.data.state === GameState.NewGame
  ) {

    game.fireEvent(
      new Event(GameEvent.ChangeState, 
      {
        channel: Channels.ChangeState,
        data: {state: GameState.Open}
      })
    )

    let auto: AutoData = game.global.get("AutoData")
    auto.isSelectWinnerTimerPlaying = false
  }
}


function isDoneSelectedWinners(gameData: GameData, event: Event): boolean {
  return (gameData.state === GameState.SelectedWinners &&
  event.msg.data.state === GameState.SelectedWinners)
}


export class Host {
  id = 0
  constructor(id) {
    this.id = id
  }
}

export enum AutoChannel {
  Start = "/Start",
  Stop = "/Stop",
}


