import { Channels, GameEvent, GameState, hasGameEvent } from "../../../utils/common";
import { PlayerManager } from "../../HorseraceManager";
import { SocketPlugin } from "../core/SocketPlugin";
import { Game, Plugin } from "../core/WorldManager";
import { BetData } from "./BetPlugin";
import { Prize } from "./PrizePlugin";
import { Wallet } from "./WalletPlugin";

export class ReplyPlugin implements Plugin {
	build(game: Game): void {
    game
      .system(broadcastEvent)
      .system(broadcastBets)
      .system(broadcastPrizes)
	}
}

function broadcastEvent(game: Game) {
  game.events.forEach((e) => {
    if (e.type !== GameEvent.Broadcast) {
      return
    }
    const playerManager = PlayerManager.getInstance()
    const state = playerManager.getHorseGameState()
    const check_void = playerManager.getHorseGameVoid()
    console.log("broadcast", e.msg)
 
    if(!check_void && state == "Void"){
      console.log(state)
      playerManager.setHorseGameVoid(true)
    }
    else{
      playerManager.setHorseGameVoid(false)
    }
    game.view(Game.wsType).each((entity, socket) => {
      socket.send(JSON.stringify(e.msg))
    });
  })
}

function broadcastBets(game: Game) {
  if (!hasGameEvent(game, GameEvent.CalcAllBets)) return
  let betData: BetData = game.global.get("BetData")
 
  game.view(Game.wsType, Wallet).each((entity, socket, wallet) => {
    socket.send(JSON.stringify({
      channel: Channels.Game,
      data: {
        credits: wallet.newCredits,
        odds: Object.fromEntries(betData.odds) 
      }
    }))
  });
}

function broadcastPrizes(game: Game) {
  game
    .view(Game.wsType, Prize, Wallet)
    .each((entity, socket, prize, wallet) => {
      const playerManager = PlayerManager.getInstance()
      const state = playerManager.getHorseGameState()
  
      if(state == GameState.Void) return
      
      socket.send(JSON.stringify({
        channel: Channels.Game,
        data: {
          credits: wallet.newCredits + prize.amount,
          prize: prize.amount
        }
      }))
  });
}

function broadcastFinalized(game: Game) {
/*   game.events.forEach((e) => {
    if (e.type !== GameEvent.Finalized) {
      return
    }

    game.view(Game.wsType).each((entity, socket) => {
      socket.send(JSON.stringify({
        channel: Channels.ChangeState,
        data: {state: GameState.SelectedWinners}
      }))
    });
  }) */
}

