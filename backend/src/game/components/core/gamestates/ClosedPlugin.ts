import { Channels, GameEvent, GameState } from "../../../../utils/common";
import { Event, Game as game, GameData, Plugin } from "../WorldManager";
import { PlayerManager } from "../../../HorseraceManager";
import GameRound from "../../../../../models/GameRound";
import ReturnBet from "../../transaction/returnBet";

export class ClosedPlugin implements Plugin {
	build(game: game): void {
		game
			.system(update);
	}
}

function update(game: game) {
  game.events.forEach(async (e) => {
    if (e.type === GameEvent.ChangeState) {
      let gameData: GameData = game.global.get("GameData")

      if (
        gameData.state === GameState.Open &&
        e.msg.data.state === GameState.Closed
      ) {
        const playerManager = PlayerManager.getInstance()
        const playerChains = playerManager.getHorseChain()

        gameData.state = GameState.Closed

        game.fireEvent(new Event(GameEvent.Broadcast, {
          channel: Channels.ChangeState,
          data: {
            state: GameState.Closed,
            playerChain: playerChains,
          }
        }))
 
        const player_winner = playerManager.getHorseWinner()
        const game_id = playerManager.getHorseGameId()
        let betData = game.global.get("BetData")
        playerManager.setHorseGameState("")
        if(betData.bets.size){ // if 0
          const latestGameRound = await GameRound.findOne({
            where: {
              GAME_ID: game_id
            },
            order: [
              ['id', 'DESC']  
            ]
          });
          latestGameRound.GAME_ROUND_RESULT =  JSON.stringify({
            bets : Object.fromEntries(betData.bets),
            odds : Object.fromEntries(betData.odds),
            gross : betData.gross,
            net : betData.net,
            commission : betData.commission,
            winner : player_winner
          })

          latestGameRound.save()
            
          const round_odds = Array.from(betData.odds.values());
    
          const void_round = round_odds.some(value => +value < 1.6);

          const get = playerManager.getHorseRaceGameRound()
            
          // if(void_round){

          //   latestGameRound.STATUS = "CANCELLED" 

            
          //   await ReturnBet({
          //     game,
          //     gameId : latestGameRound.GAME_ID,
          //     gameRound :latestGameRound.GAMEROUND,
          //   })
            
          //   // game.fireEvent(new Event(GameEvent.Broadcast, {
          //   //   channel: '/GameVoid',
          //   //   data: {
          //   //     state: GameState.Void,
          //   //     message: "game has been voided.",
          //   //     status: "void" 
          //   //   }
          //   // }))
            
          //   latestGameRound.save()
          // }

        }

      }
    }
  })
}
