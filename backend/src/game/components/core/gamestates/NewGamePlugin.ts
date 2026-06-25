import { Channels, GameEvent, GameState } from "../../../../utils/common";
import { Event, Game, GameData, Plugin } from "../WorldManager";
import { PlayerManager } from "../../../HorseraceManager";
import GameRound from "../../../../../models/GameRound";
import moment from "moment";

export class NewGamePlugin implements Plugin {

	build(game: Game): void {
		game
			.system(update);
	}
}
function update(game: Game) {
  game.events.forEach(async (e) => {
    if (e.type === GameEvent.ChangeState) {
      let gameData: GameData = game.global.get("GameData")
      const newGameAllowed = 
      gameData.state === GameState.SelectedWinners || 
      gameData.state === GameState.Idle
      
      if (
        newGameAllowed &&
        e.msg.data.state === GameState.NewGame
      ) {
     
        await CreateGameRound()
        
        gameData.state = GameState.NewGame
        gameData.reset()
        game.fireEvent(new Event(GameEvent.Broadcast, {
          channel: Channels.ChangeState,
          data: {
            state: GameState.NewGame,
          }
        }))
      }
    }
  })
}

async function  CreateGameRound(){
  const playerManager = PlayerManager.getInstance()

  const game_id = -1

  await playerManager.clearHorseBet() //clear all bets

  const latestGameRound = await GameRound.findOne({
    where: {
      GAME_ID: game_id
    },
    order: [
      ['id', 'DESC']  
    ]
  });
  const get_gameround = latestGameRound?.GAMEROUND || 'null'
  const GAMEROUND = +(get_gameround == 'null' ? 0 : get_gameround) + 1

  const currentDate = moment().format('YYYYMMDD');
  const TRANSACTION_ID = `${currentDate}${GAMEROUND}`
  const game_data = {
    GAME_ID : game_id,
    TRANSACTION_ID,
    STATUS : "ONGOING",
    GAMEROUND,
   
  }
 
 const gameround = await GameRound.create(game_data)

 await playerManager.setHorseRaceGameRound(gameround.GAMEROUND)

}