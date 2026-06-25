import { Entity } from "uecs";
import { User as CoreUser, UserTag } from "../core/UserPlugin";
import { Event, Game, Plugin } from "../core/WorldManager";
import WalletDb from "../../../../models/Wallet";
import { Channels, GameEvent, GameState } from "../../../utils/common";
import { Bet, BetData, NewBetTag } from "./BetPlugin";
import { SocketPlugin } from "../core/SocketPlugin";
import { Prize } from "./PrizePlugin";
import User  from "../../../../models/User"; 
import { PlayerManager } from "../../HorseraceManager";

export class WalletPlugin implements Plugin {
	build(game: Game): void {
    game
      .system(insert)
      .system(validateBets)
      .system(updateWalletWithPrize)
	}
}

function insert(game: Game) {
  game
    .view(CoreUser, UserTag, Game.wsType)
    .each((entity, user, userTag, socket) => {
    if (user.payload.type !== 'player') {
      return
    }
    insertWallet(game, entity, user, socket)
  })
}

function validateBets(game: Game) {
  game
    .view(Bet, NewBetTag, Wallet)
    .each((entity, bet, tag, wallet) => {
      let total = 0
      bet.new.forEach((val, key) => {
        total += val
      })
      
      if (!hasEnoughCredits()) { return }

      processBet()
      game.fireEvent(new Event(GameEvent.CalcAllBets, {
        channel: "",
        data: ""
      }))

      function hasEnoughCredits() {
        return total <= wallet.credits
      }

      function processBet() {
        wallet.newCredits = wallet.credits
        wallet.newCredits -= total

        // bet.current.clear()
        bet.current = new Map(bet.new)
        bet.new.clear()
      }
    })
}

async function insertWallet(
  game: Game, 
  entity: Entity, 
  user: CoreUser,
  socket
) {
  try {
    
    let user_detail = await User.findOne({ where: {mobile : user.payload.mobile_number } });
    if (!user_detail) {
      throw { message: "User not found" };
    }

    let walletDb = await WalletDb.findOne({ where: { userId: user_detail.id} })
    game.emplace(entity, new Wallet(walletDb.credits))

    socket.send(JSON.stringify({
      channel: Channels.Game,
      data: { credits: walletDb.credits }
    }))
    
    // console.log("walletDb.credits", walletDb.credits)
  } catch(e) {
    console.error(e)
  }
}

function updateWalletWithPrize(game: Game) {
  game
    .view(Wallet, Prize, CoreUser)
    .each((entity, wallet, prize, user) => {

      const playerManager = PlayerManager.getInstance()
      const state = playerManager.getHorseGameState()

      if(state == GameState.Void) return

      wallet.credits = wallet.newCredits + prize.amount
      updateDb(
        wallet, 
        user.id,
        user.payload.mobile_number
      )
      
    })
}

async function updateDb(
  wallet: Wallet,
  userId: number,
  mobile : string
) {
  try {
    let user_detail = await User.findOne({ where: {mobile} });
    if (!user_detail) {
      throw { message: "User not found" };
    }

    let walletDb = await WalletDb.findOne({ where: { userId: user_detail.id} })
    walletDb.credits = wallet.credits
    await walletDb.save()
  } catch(e) {
    console.error(e)
  }
}


export class Wallet {
  newCredits: number
  credits: number
  constructor(credits: number) {
    this.credits = credits
    this.newCredits = credits
  }
}


