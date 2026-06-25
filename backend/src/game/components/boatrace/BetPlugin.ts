import { Channels, GameEvent, GameState, hasGameEvent } from "../../../utils/common";
import { User, UserTag } from "../core/UserPlugin";
import { Utils } from "../core/Utils";
import { Event, Game, GameData, Input, Plugin } from "../core/WorldManager";

export class BetPlugin implements Plugin {
	build(game: Game): void {
		game
      .system(insert)
      .system(removeNewBetTags)
			.system(placeBets)
      .system(calculateBets)
      .system(calcOdds)
      .system(gameStateChanged)

    game
      .global.set("BetData", new BetData())
	}
}

function insert(game: Game) {
  game.view(User, UserTag).each((entity, user, userTag) => {
    if (user.payload.type !== 'player') {
      return
    }
    game.insert(entity, new Bet)
  })

}

function removeNewBetTags(game: Game) {
  game.view(NewBetTag).each((entity, tag) => {
    game.remove(entity, NewBetTag)
  })
}

function placeBets(game: Game) {
  let gameData: GameData = game.global.get("GameData")
  if (gameData.state !== GameState.Open) { return }

  game.view(Input, Bet).each((entity, input, bet) => {
    if (input.json.channel !== Channels.Bet) { return }
    bet.new = new Map(Object.entries(input.json.data.bets))
    game.emplace(entity, NewBetTag)
  });
}

function calculateBets(game: Game) {
  if (!hasGameEvent(game, GameEvent.CalcAllBets)) return

  let betData: BetData = game.global.get("BetData")
  betData.reset()

  game.view(Bet).each((entity, bet) => {
    bet.current.forEach((amount, key) => {
      let val = betData.bets.get(key);
      if (typeof val === 'number') {
        val += amount
      } else {
        val = amount
      }
      betData.bets.set(key, val)
    })
  });

  betData.bets.forEach((val, key) => {
    betData.gross += val
    betData.net = betData.gross - (betData.gross * betData.commission)
  })
}

function calcOdds(game: Game) {
  if (!hasGameEvent(game, GameEvent.CalcAllBets)) return
  let betData: BetData = game.global.get("BetData")

  betData.bets.forEach((val, key) => {
    betData.odds.set(key, betData.net / val)
  })
}


function gameStateChanged(game: Game) {
  game.events.forEach((e) => {
    if (e.type !== GameEvent.Broadcast) {
      return
    }

    if (e.msg.channel === Channels.ChangeState &&
      e.msg.data.state === GameState.NewGame
    ) {
      let betData: BetData = game.global.get("BetData")
      betData.reset()

      game.view(Bet).each((entity, bet) => {
        bet.current.clear()
        bet.new.clear()
      });
    }

    
  })
}


export class Bet {
  current: Map<string, number> = new Map()
  new: Map<string, number> = new Map()
  

}

export class NewBetTag { }

export class BetData {
  constructor() { }

  bets = new Map<string, number>()
  odds = new Map<string, number>()
  gross = 0.0
  net = 0.0
  commission = 0.10
  calculateAllBets = false
  
  reset() {
    this.bets.clear()
    this.odds.clear()
    this.gross = 0.0
    this.net = 0.0
    this.calculateAllBets = false
  }
}

