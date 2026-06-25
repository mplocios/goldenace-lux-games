import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import User from "../../models/User";
import Wallet from "../../models/Wallet";
import BetTransaction from "../../models/BetTransaction";
import Bets from "../../models/Bets";
import GameRound from "../../models/GameRound";
import Game from "../../models/Game";
import formBody from "@fastify/formbody";
import { CasinoManager } from "../manager/CasinoManager";
import generateSignature from "../utils/calculateXSign";
import { generateRandomChar } from "../utils/common";
import { encrypt } from "../utils/encryption";
import CommissionDistribution from "../services/CommissionDistribution";
import CreditHistory from "../services/CreditHistory";
import getAgentId from "../services/AgenDbId";

export class CallbackController {
  static async init(app: FastifyInstance) {
    app.register(formBody);
    app.route({
      method: ["GET", "POST"],
      url: "/casino/callback",
      handler: CallbackHandler.callbackCasino, 
    });
  }
}

// Class to handle the callback actions
export class CallbackHandler {

  casinoManager : CasinoManager

  static async callbackCasino(req: FastifyRequest<{ Body: CasinoCallback }>, res: FastifyReply) {
    try {
      const { action,transaction_id } = req.body;

      const requestData = req.body;
      
      const transactionService = new TransactionService();
      
      if(!action) return;

      const headers = {
          'X-Merchant-Id': req.headers['x-merchant-id'],
          'X-Timestamp': req.headers['x-timestamp'],
          'X-Nonce': req.headers['x-nonce'],
      };
      const data = {
        ...requestData,
      };

  
      const mergeObj = {
        ...headers,
        ...data
      }
      const signature = generateSignature(mergeObj);

      if(signature != req.headers['x-sign']) return {
        error_code: "INTERNAL_ERROR",
        error_description: "X-Sign is Invalid",
      };
            

      switch (action) {
        case "balance":
          return await transactionService.balance(req.body) ;
        case "bet":
          return await transactionService.bet(req.body);
        case "win":
          return await transactionService.win(req.body);
        case "refund":
          return await transactionService.refund(req.body);
        case "rollback":
          return await transactionService.rollback(req.body);
        default:
          return res.status(400).send({
            success: false,
            message: "Invalid action.",
          });
      }

    } catch (e) {
      console.error("Error processing callback:", e);
      return res.status(500).send({
        success: false,
        message: "An error occurred while processing the callback.",
      });
    }
  }
}

class TransactionService {
  async balance(data) {
    try {
      console.log('balance : ',data)
      const { player_id, amount, game_uuid, round_id ,transaction_id} = data;
      if(!player_id || isNaN(player_id)) return {
        error_code: "INTERNAL_ERROR",
        error_description: "Player not found.",
      };

      const wallet = await Wallet.findOne({
        where: {
          userId: +player_id,
        },
      });
     
      if(!wallet){
        return { 
          error_code: "INTERNAL_ERROR",
          error_description: "Player not found.",
        };
      }

      const response = {
        balance : wallet ? wallet.credits : 0,
      }
      return response
    } catch (e) {
      console.error("balance: ", e);
      return { message: e.message };
    }
  }

  async bet(data) {
    try {
      console.log('bet : ',data)
      const { player_id, game_uuid, round_id ,transaction_id, session_id} = data;
      const amount = parseFloat(data.amount);
      const casinoManager = CasinoManager.getInstance()
      let check_session = await casinoManager.getUserCasinoSession(player_id)
      if(!check_session || (check_session != session_id)) return { message: "Session not exist." };
      
      if(!transaction_id) return { message: "Transaction ID not found." };
      if(+amount < 0) return { message: "Bet Amount is Invalid." }

      const wallet = await Wallet.findOne({
        where: {
          userId: player_id,
        },
      });
      const current_credit = wallet.credits
      if (!wallet) return { 
        error_code: "INTERNAL_ERROR",
        error_description: "Player not found." 
      };
      if(wallet.credits < amount) {
        return  {
          error_code: "INSUFFICIENT_FUNDS",
          error_description: "Player does not have enough balance to place this bet.",
        }
      } 

      let gameDetail : any = await Game.findOne({
        where: {
          uuid: game_uuid,
        },
      });

      if (!gameDetail) gameDetail = {id : 0}
      const { id } = gameDetail;
     
      let gameRound = await GameRound.findOne({
        where: {
          TRANSACTION_ID : transaction_id
        },
      });

      if (!gameRound) {
        gameRound = await GameRound.create({
          GAME_ID: +id,
          GAMEROUND: round_id,
          STATUS: "ONGOING",
          TRANSACTION_ID : transaction_id
        });
      }

      const check_bet = await BetTransaction.findOne({
        where : {
          TRANSACTION_ID : transaction_id
        }
      });
      let agent_id = await getAgentId(player_id)
 
      if(!check_bet){
        const bet = await BetTransaction.create({
          userId: +player_id,
          GAME_ID: +id,
          GAMEROUND_ID: +gameRound.ID,
          BET_AMOUNT: +amount,
          TRANSACTION_ID : transaction_id,
          STATUS: "ONGOING",
        });
        const agent_info_id = +agent_id.data.data.id
        const com_ds = {
          data :{
            game_type : 'pragmatic',
            user_id : agent_info_id,
            transaction_id : bet.TRANSACTION_ID,
            bet_transaction_id : +bet.ID,
            bet_amount : `${amount}`,
            turnover: `${amount}`,
            payout : `0`,
            net_win :`${-amount}`,
          }
        }
      
         CommissionDistribution(com_ds)
        if (!bet) return { message: "There is something wrong with your bet." };

        if (wallet) {
          const new_credit =  +wallet.credits - +amount
          const newCredit = new_credit.toFixed(4)
          wallet.credits = +newCredit ;

          await wallet.save();
          let old_credit = Math.floor(current_credit * 100) / 100;
          let amount_credit = Math.floor(amount * 100) / 100;
     
          const request = {
            data :{
              // game_type : 'pragmatic',
              user_id : agent_info_id,
              action : 'DECREASE',
              main_db_transaction_number : transaction_id,
              value_before : `${old_credit}`,
              value : `${amount_credit}`,
              value_after: `${wallet.credits}`,
              modified_by :+agent_info_id,
              created_by :+agent_info_id,
            }
          }
    
           CreditHistory(request)
    
        }
        
      }

      const response = {
        balance : wallet ? wallet.credits : 0,
        transaction_id : await encrypt(transaction_id)
      }
      return response
    } catch (e) {
      console.error("bet: ", e);
      return { message: e.message };
    }
  }

  async win(data) {
    try {
   
      const { player_id , game_uuid ,round_id, transaction_id, session_id} = data;
      const amount = parseFloat(data.amount);
      let agent_id = await getAgentId(player_id)
      const agent_info_id = +agent_id.data.data.id
      if(!transaction_id) return { message: "Transaction ID not found." };
      
      let gameDetail : any = await Game.findOne({
        where: {
          uuid: game_uuid,
        },
      });

      if (!gameDetail) gameDetail = {id : 0}
      const { id } = gameDetail;

      const wallet = await Wallet.findOne({
        where: {
          userId: player_id,
        },
      });
      const current_credit = wallet.credits
      if (!wallet) return { message: "Player wallet not found." };

      const gameRound = await GameRound.findOne({
        where: {
          GAME_ID: +id,
          GAMEROUND: round_id,
        },
      });
   
      if (!gameRound) {
        // console.log("(skipping) round id already exist :", round_id);
        const response = {
          balance : wallet ? wallet.credits : 0,
          transaction_id : await encrypt(transaction_id)
        };
        return response;
      };

      const totalBetAmount = await BetTransaction.sum('BET_AMOUNT', {
        where: {
          userId: +player_id,
          GAME_ID: +id,
          GAMEROUND_ID: +gameRound.ID,
        }
      }) || 0;
     
      const netWin = +amount - +totalBetAmount;
     
      const check_winnings = await Bets.findOne({
        where : {
          transaction_id,
     
        }
      });

      if(!check_winnings){
        await BetTransaction.update(
          { STATUS: 'COMPLETE' },  
          { 
            where: { 
              GAME_ID: +id,
              GAMEROUND_ID: gameRound.ID,
            } 
          } 
        );

        const old_balance = wallet.credits;
        const new_credit =  +wallet.credits  + +amount
        wallet.credits = new_credit.toFixed(4);
 
        await wallet.save();
        // const check_winnings_ = await Bets.findOne({
        //   where : {
        //     gameId : id,
        //     userId : +player_id,
        //     gameRoundId : +gameRound.ID,
        //   }
        // });
        // if(!check_winnings_){
          const bet_save = {
              gameId : id,
              transaction_id : transaction_id,
              userId : +player_id,
              gameRoundId : +gameRound.ID,
              turnover : +totalBetAmount,
              payout : +amount,
              returnBet : 0,
              netWin,
              event : netWin > 0 ? "Win" : netWin == 0 ? "Draw" : "Lose",
              previousBalance : parseFloat(old_balance)  + totalBetAmount ,
              newBalance : wallet.credits
          }
          const bets = await Bets.create(bet_save);

        //   console.log(bet_save)
        // }
       
        gameRound.STATUS = "COMPLETE"
        gameRound.save();

        } 
        let old_credit = Math.floor(current_credit * 100) / 100;
        let amount_credit = Math.floor(amount * 100) / 100;
        
        const getBet = await BetTransaction.findOne({
          where: {
            userId: +player_id,
            GAME_ID: +id,
            GAMEROUND_ID: +gameRound.ID,
          }
        });
        
          const credit_history = {
            data :{
              user_id : +agent_info_id,
              action : 'INCREASE',
              main_db_transaction_number : getBet.TRANSACTION_ID,
              value_before : `${old_credit}`,
              value : `${amount_credit}`,
              value_after: `${wallet.credits}`,
              modified_by :+agent_info_id,
              created_by :+agent_info_id,
            }
          }
    
          CreditHistory(credit_history)
    
          const request = {
            data :{
              game_type : 'pragmatic',
              user_id : agent_info_id,
              transaction_id : getBet.TRANSACTION_ID,
              bet_transaction_id : +getBet.ID,
              bet_amount : `${getBet.BET_AMOUNT}`,
              turnover: `${totalBetAmount}`,
              payout : `${amount}`,
              net_win :`${netWin}`,
            }
          }
          CommissionDistribution(request)
       
      const response = {
        balance : wallet ? wallet.credits : 0,
        transaction_id : await encrypt(transaction_id)
      }
      return response
    } catch (e) {
      console.error("win: ", e);
      return { message: e.message };
    }
  }

  async refund(data) {
    try {
      const { player_id , game_uuid ,round_id,transaction_id,bet_transaction_id, session_id} = data;
      const amount = parseFloat(data.amount);
      const wallet = await Wallet.findOne({
        where: {
          userId: player_id,
        },
      });

      if(!transaction_id) return { message: "Transaction Id not found." };

      let check_bet : any = await BetTransaction.findOne({
        where : {
          TRANSACTION_ID : bet_transaction_id,
        }
      });
      console.log(bet_transaction_id)
 
      if(!check_bet){
        console.log("not duplicate")
        check_bet = await Bets.findOne({
          where : {
            transaction_id : bet_transaction_id,
          }
        });

        if(!check_bet) {
          const response = {
            balance : wallet ? wallet.credits : 0,
            transaction_id : await encrypt(bet_transaction_id)
          }
          return response;
        }
      }

      if(check_bet?.STATUS == 'CANCELLED' || check_bet?.status == 'CANCELLED'){
        const response = {
          balance : wallet ? wallet.credits : 0,
          transaction_id : await encrypt(bet_transaction_id)
        };
        return response;
      }

      let gameDetail : any = await Game.findOne({
        where: {
          uuid: game_uuid,
        },
      });

      if (!gameDetail) gameDetail = {id : 0}
      const { id } = gameDetail;

      if(!wallet) return { message: "Wallet not found." };

      const gameRound = await GameRound.findOne({
        where: {
          GAME_ID: +id,
          TRANSACTION_ID: bet_transaction_id,
          STATUS: 'ONGOING'
        },
      });

      if(!gameRound) return { message: "Game Round not found." };

      gameRound.STATUS = 'CANCELLED';
      gameRound.save();

      if(check_bet){
        await check_bet?.STATUS ? check_bet.STATUS = 'CANCELLED' : check_bet.status = 'CANCELLED';
        await check_bet.save();
        const new_credit =  +wallet.credits  + +amount
        wallet.credits = new_credit.toFixed(4);
        await wallet.save();      
      }
      
      const response = {
        balance : wallet ? wallet.credits : 0,
        transaction_id : await encrypt(bet_transaction_id)
      }
      // console.log("refund response: ", response)
      return response
    } catch (e) {
      console.error("refund: ", e);
      return { message: e.message };
    }
  }
  async rollback(data) {
    try {
      const { player_id, currency, game_uuid, transaction_id, session_id, type, round_id } = data;
      const rollbackTransactions = [
        {
          action: data['rollback_transactions[0][action]'],
          amount: data['rollback_transactions[0][amount]'],
          transaction_id: data['rollback_transactions[0][transaction_id]'],
          type: data['rollback_transactions[0][type]']
        },
        {
          action: data['rollback_transactions[1][action]'],
          amount: data['rollback_transactions[1][amount]'],
          transaction_id: data['rollback_transactions[1][transaction_id]'],
          type: data['rollback_transactions[1][type]']
        }
      ];
  
      const wallet = await Wallet.findOne({
        where: { userId: player_id },
      });
  
      if (!wallet) return { message: "Wallet not found." };

      let return_amount = +wallet.credits;
      let bet_transaction_id = '';
      let win_transaction_id = '';
      
      for (const rollbackTransaction of rollbackTransactions) {
       
        if (rollbackTransaction.action == 'bet') {
          bet_transaction_id = rollbackTransaction.transaction_id;
          const check_bet = await BetTransaction.findOne({
            where: {
              TRANSACTION_ID: bet_transaction_id,
            }
          });
          
          if (check_bet.STATUS == 'ROLLBACK') {
            return {
              balance: wallet ? wallet.credits : 0,
              transaction_id :  await encrypt(transaction_id),
              rollback_transactions: [
                bet_transaction_id,
                data['rollback_transactions[1][transaction_id]']
              ]
            };
            // return { message: "Transaction bet already rolledback." };
          }
  
          check_bet.STATUS = 'ROLLBACK';
          await check_bet.save();
          return_amount += parseFloat(rollbackTransaction.amount);
        } else if (rollbackTransaction.action == 'win') {
          win_transaction_id = rollbackTransaction.transaction_id;
          const check_bet = await Bets.findOne({
            where: {
              transaction_id: win_transaction_id,
            }
          });
  
          if (check_bet.status == 'ROLLBACK') {
            return {
              balance: wallet ? wallet.credits : 0,
              transaction_id :  await encrypt(transaction_id),
              rollback_transactions: [
                data['rollback_transactions[0][transaction_id]'],
                win_transaction_id
              ]
            };
            // return { message: "Transaction win already rolledback." };
          }
  
          check_bet.status = 'ROLLBACK';
          await check_bet.save();
          return_amount -= parseFloat(rollbackTransaction.amount);
        } else {
          return { message: "There is something wrong with your action." };
        }
   
      }
      wallet.credits = +return_amount.toFixed(4)
      await wallet.save();
      return {
        balance: wallet ? wallet.credits : 0,
        transaction_id :  await encrypt(transaction_id),
        rollback_transactions: [
          bet_transaction_id,
          win_transaction_id
        ]
      };
    } catch (e) {
      console.error("rollback: ", e);
      return { message: e.message };
    }
  }
  
}

interface CasinoCallback {
  action?: string;
  player_id?: any;
  amount?: any;
  currency?: any;
  game_uuid?: any;
  transaction_id?: any;
  type?: any;
  freespin_id?: any;
  quantity?: any;
  round_id?: any;
  finished?: any;
  session_id?: any;
}
