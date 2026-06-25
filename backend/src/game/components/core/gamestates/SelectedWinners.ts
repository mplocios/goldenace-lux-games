import { Channels, GameEvent, GameState } from "../../../../utils/common";
import { Event, Game, GameData, Plugin } from "../WorldManager";
import { PlayerManager } from "../../../HorseraceManager";
import GameRound from "../../../../../models/GameRound";
import BetTransaction from "../../../../../models/BetTransaction";
import Bets from "../../../../../models/Bets";
export class SelectedWinners implements Plugin {
	build(game: Game): void {
		game
			.system(update)
      .system(broadcastSelectedWinners);
	}
}

function update(game: Game) {
  game.events.forEach(async (event) => {
    let gameData: GameData = game.global.get("GameData")

    if (!isRequestValid(gameData, event)) { return }
    const playerManager = PlayerManager.getInstance()
    gameData.state = GameState.SelectedWinners
    gameData.winners = event.msg.data.winners
    let betData = game.global.get("BetData")
    await updateGameRound(playerManager)
    await saveBetHistory(playerManager,betData)
     
    game.fireEvent(new Event(GameEvent.CalcPrizes, {
      channel: "",
      data: ""
    }))
  })
}

function broadcastSelectedWinners(game: Game) {
  game.events.forEach((e) => {
    if (e.type !== GameEvent.Finalized) {
      return
    }

    game.fireEvent(
      new Event(GameEvent.Broadcast, 
      {
        channel: Channels.ChangeState,
        data: {state: GameState.SelectedWinners}
      })
    )
  })
}


function isRequestValid(gameData: GameData, event: Event): boolean {
  if (event.type === GameEvent.ChangeState) {

    // console.log("Test", gameData.state, event.msg.data)
    const data = event.msg.data
    if (
      gameData.state === GameState.Closed &&
      data.winners &&
      data.state === GameState.SelectedWinners
    ) {
      return true
    }
  }
  return false
}

async function updateGameRound(playerManager){
    
    let gameround = playerManager.getHorseRaceGameRound()

    const get_gameround = await GameRound.findOne({
      where: { GAMEROUND: gameround , STATUS : "ONGOING"}
    });
   
    if(get_gameround){
      get_gameround.STATUS = "COMPLETE"

      await BetTransaction.update(
        { STATUS: 'COMPLETE' }, // Set the STATUS to "COMPLETE"
        { 
          where: { GAMEROUND_ID: get_gameround.ID },
        }  
         // Filter records by GAME_ID
      );
      await get_gameround.save();
    }
}

async function saveBetHistory(playerManager,betData){
  let bets = playerManager.getAllHorseBets()
  let gameround = playerManager.getHorseRaceGameRound()
  if(Object.keys(bets).length){
  
    let odds =  Object.fromEntries(betData.odds)
    let win_bet = playerManager.getHorseWinner()
    let game_id = playerManager.getHorseGameId()
    Object.keys(bets).forEach(async key=>{
      let player_totalbet = playerManager.getPlayerTotalBet(key)
      
      const user_bet = bets[key]
      const payout = (user_bet[win_bet] || 0) * odds[win_bet]
      const netWin = payout - player_totalbet.TotalBet
      const data = {
        gameId : game_id,
        userId : key,
        gameRoundId : gameround,
        result : JSON.stringify({
          bets : user_bet,
          odds,
          winner : win_bet,
          turnover : player_totalbet.TotalBet,
          payout,
          returnBet: 0,
          netWin,
          event : netWin == 0 ? "Draw"  : netWin>0 ? "Win" : "Lose"
        }),
        turnover : player_totalbet.TotalBet,
        payout,
        returnBet: 0,
        netWin,
        event : netWin == 0 ? "Draw"  : netWin>0 ? "Win" : "Lose"
      }
      const bet = await Bets.create(data)
    })
  }
}