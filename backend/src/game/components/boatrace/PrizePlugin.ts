import { GameEvent, hasGameEvent } from "../../../utils/common";
import { User, UserTag } from "../core/UserPlugin";
import { Event, Game, GameData, Plugin } from "../core/WorldManager";
import { Bet, BetData } from "./BetPlugin";

export class PrizePlugin implements Plugin {
	build(game: Game): void {
		game
      .system(removePrize)
			.system(update);
	}
}

function removePrize(game: Game) {
  game.view(Prize).each((entity, tag) => {
    game.remove(entity, Prize)
  });
}

function update(game: Game) {
  if (!hasGameEvent(game, GameEvent.CalcPrizes)) return

  let gameData: GameData = game.global.get("GameData")
  if (gameData.winners.length === 0) {return}

  let betData: BetData = game.global.get("BetData")
  game.view(Bet).each((entity, bet) => {
    let key: string = gameData.winners[0]
    if (bet.current && bet.current.has(key)) {
      const amount = bet.current.get(key)
    
      const slotGross = betData.bets.get(key)
      const ratio = amount / slotGross
      const prize = betData.net * ratio
  
      game.emplace(entity, new Prize(prize))
    } else {
      game.emplace(entity, new Prize(0))
    }
  });

  game.fireEvent(new Event(GameEvent.Finalized, {
    channel: "",
    data: ""
  }))
}

export class Prize {
  amount: number
  constructor(amount: number) {
    this.amount = amount
  }
}


