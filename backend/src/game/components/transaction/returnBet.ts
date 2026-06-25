import BetTransaction from "../../../../models/BetTransaction";
import Wallet from "../../../../models/Wallet";
import WebSocketService from "../../../services/WebSocketService";
import { PlayerManager } from "../../HorseraceManager";
import { Game, Plugin } from "../core/WorldManager";
import { Channels, GameEvent, GameState } from "../../../utils/common";
import { Prize } from "../boatrace/PrizePlugin";
import { Wallet as wallet } from "../boatrace/WalletPlugin";
type BetData = {
  userId: number;
  returnValue: number;
};

export default async function ReturnBet({game,gameId,gameRound}){
try{

    const bet_transaction = await BetTransaction.findAll({
      where : {
        GAME_ID : gameId,
        GAMEROUND_ID : gameRound
      }
    })
 
    if(!bet_transaction) throw {message : "transaction not found."}

    const playerManager = PlayerManager.getInstance()

    playerManager.setHorseGameState(GameState.Void)
    const betsData = bet_transaction.map(transaction => transaction.get({ plain: true }));

    await betsData.forEach(async bet=>{

      const bet_detail = await BetTransaction.findByPk(bet.ID)
      bet_detail.STATUS = "VOID"
      bet_detail.save()

    })

    const result: BetData[] = Object.values(betsData.reduce((acc, { userId, BET_AMOUNT }) => {
      if (!acc[userId]) {
        acc[userId] = { userId, returnValue: 0 };
      }
      acc[userId].returnValue += parseFloat(BET_AMOUNT);
      return acc;
    }, {}));
    
    result.forEach(async (bet: BetData) => {
      const wallet = await Wallet.findOne({
        where: {
          userId: bet.userId
        }
      });
    
      if (wallet) {
        const credit = wallet.credits;
        const new_credits = +credit + +bet.returnValue;
        console.log(`${credit} + ${bet.returnValue} = ${new_credits}`)
        wallet.credits = new_credits;
        await wallet.save();


      
      }
    });
 
      // game
      //   .view(Game.wsType, Prize, wallet)
      //   .each((entity, socket, prize, wallet) => {
      //     const playerManager = PlayerManager.getInstance()
      //     const state = playerManager.getHorseGameState()
      //     console.log({
      //       credits: wallet.newCredits + prize.amount,
      //       prize: prize.amount
      //     },"win1234")
      //     // if(state == GameState.Void) return
          
      //     // socket.send(JSON.stringify({
      //     //   channel: Channels.Game,
      //     //   data: {
      //     //     credits: wallet.newCredits + prize.amount,
      //     //     prize: prize.amount
      //     //   }
      //     // }))
      // });
 
    

  }catch(e){
    console.error(e)
  }

}
 