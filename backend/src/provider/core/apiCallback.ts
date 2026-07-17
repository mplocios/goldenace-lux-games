import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import * as crypto from 'crypto';
import * as qs from 'querystring';
import formBody from '@fastify/formbody';
import { COREBRIDGE_API_SECRET } from './config';
import User from '../../../models/User';
import Wallet from '../../../models/Wallet';
import BetTransaction from '../../../models/BetTransaction';
import Bets from '../../../models/Bets';
import GameRound from '../../../models/GameRound';
import Game from '../../../models/Game';
import CommissionDistribution from '../../services/CommissionDistribution';
import CreditHistory from '../../services/CreditHistory';
import getAgentId from '../../services/AgenDbId';
import { encrypt } from '../../utils/encryption';
import WebSocketService from '../../services/WebSocketService';

export class CoreBridgeCallbackController {
  static async init(app: FastifyInstance) {
    app.register(formBody);
    app.route({
      method: 'POST',
      url: '/aggregator/callback',
      handler: CoreBridgeCallbackHandler.handle,
    });
  }
}

function verifySignature(body: Record<string, any>, headers: Record<string, any>): boolean {
  const all: Record<string, any> = {
    ...body,
    'X-Merchant-Id': headers['x-merchant-id'],
    'X-Timestamp': headers['x-timestamp'],
    'X-Nonce': headers['x-nonce'],
  };

  // Match Python's urlencode(sorted(params.items())) exactly
  const entries = Object.entries(all).map(([k, v]) => [k, String(v ?? '')]);
  entries.sort((a, b) => {
    if (a[0] < b[0]) return -1;
    if (a[0] > b[0]) return 1;
    if (a[1] < b[1]) return -1;
    if (a[1] > b[1]) return 1;
    return 0;
  });
  const hashString = entries.map(([k, v]) => `${pythonQuotePlus(k)}=${pythonQuotePlus(v)}`).join('&');

  const expected = crypto
    .createHmac('sha1', COREBRIDGE_API_SECRET)
    .update(hashString)
    .digest('hex');

  return expected === headers['x-sign'];
}

function pythonQuotePlus(s: string): string {
  // Match Python's urllib.parse.quote_plus: encode everything except unreserved chars, space becomes '+'
  return encodeURIComponent(s).replace(/%20/g, '+').replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

class CoreBridgeCallbackHandler {
  static async handle(req: FastifyRequest<{ Body: CallbackBody }>, res: FastifyReply) {
    try {
      const { action } = req.body;
      if (!action) return res.status(400).send({ error_code: 'INVALID_ACTION' });

      if (!verifySignature(req.body as Record<string, any>, req.headers)) {
        return res.status(403).send({ error_code: 'INVALID_SIGNATURE', error_description: 'X-Sign verification failed' });
      }

      const ts = parseInt(req.headers['x-timestamp'] as string, 10);
      if (Math.abs(Math.floor(Date.now() / 1000) - ts) > 300) {
        return res.status(401).send({ error_code: 'AUTH005', error_description: 'Timestamp drift too large' });
      }

      const handler = new TransactionHandler();

      switch (action) {
        case 'balance':
          return await handler.balance(req.body);
        case 'bet':
          return await handler.bet(req.body);
        case 'win':
          return await handler.win(req.body);
        case 'refund':
          return await handler.refund(req.body);
        case 'rollback':
          return await handler.rollback(req.body);
        default:
          return res.status(400).send({ error_code: 'INVALID_ACTION', error_description: `Unknown action: ${action}` });
      }
    } catch (e) {
      console.error('CoreBridge callback error:', e);
      return res.status(500).send({ error_code: 'INTERNAL_ERROR', error_description: 'Internal server error' });
    }
  }
}

class TransactionHandler {
  async balance(data: CallbackBody) {
    const { player_id } = data;
    if (!player_id || isNaN(+player_id)) {
      return { error_code: 'PLAYER_NOT_FOUND', error_description: 'Player not found' };
    }

    const wallet = await Wallet.findOne({ where: { userId: +player_id } });
    if (!wallet) {
      return { error_code: 'PLAYER_NOT_FOUND', error_description: 'Player not found' };
    }

    return { balance: wallet.credits };
  }

  async bet(data: CallbackBody) {
    const { player_id, game_uuid, round_id, transaction_id, session_id } = data;
    const amount = parseFloat(data.amount);

    if (!transaction_id) return { error_code: 'MISSING_PARAM', error_description: 'transaction_id required' };
    if (amount < 0) return { error_code: 'INVALID_AMOUNT', error_description: 'Invalid bet amount' };

    const wallet = await Wallet.findOne({ where: { userId: +player_id } });
    if (!wallet) return { error_code: 'PLAYER_NOT_FOUND', error_description: 'Player not found' };

    if (wallet.credits < amount) {
      return { error_code: 'INSUFFICIENT_BALANCE', error_description: 'Player does not have enough funds' };
    }

    let gameDetail: any = await Game.findOne({ where: { uuid: game_uuid } });
    if (!gameDetail) gameDetail = { id: 0 };
    const { id } = gameDetail;

    const existingBet = await BetTransaction.findOne({ where: { TRANSACTION_ID: transaction_id } });
    if (existingBet) {
      return { balance: wallet.credits };
    }

    let gameRound = await GameRound.findOne({ where: { TRANSACTION_ID: transaction_id } });
    if (!gameRound) {
      gameRound = await GameRound.create({
        GAME_ID: +id,
        GAMEROUND: round_id,
        STATUS: 'ONGOING',
        TRANSACTION_ID: transaction_id,
      });
    }

    const currentCredits = wallet.credits;
    const bet = await BetTransaction.create({
      userId: +player_id,
      GAME_ID: +id,
      GAMEROUND_ID: +gameRound.ID,
      BET_AMOUNT: +amount,
      TRANSACTION_ID: transaction_id,
      STATUS: 'ONGOING',
    });

    const playable = +(+wallet.credits - (+wallet.withdrawable || 0)).toFixed(4);
    const fromWithdrawable = Math.max(0, +(amount - playable).toFixed(4));
    if (fromWithdrawable > 0) {
      wallet.withdrawable = +(+wallet.withdrawable - fromWithdrawable).toFixed(4);
    }
    const newCredit = (+wallet.credits - +amount).toFixed(4);
    wallet.credits = +newCredit;
    await wallet.save();

    try {
      const agent_id = await getAgentId(player_id);
      const agent_info_id = +agent_id.data.data.id;

      CommissionDistribution({
        data: {
          game_type: gameDetail.provider || 'corebridge',
          user_id: agent_info_id,
          transaction_id: bet.TRANSACTION_ID,
          bet_transaction_id: +bet.ID,
          bet_amount: `${amount}`,
          turnover: `${amount}`,
          payout: '0',
          net_win: `${-amount}`,
        },
      });

      CreditHistory({
        data: {
          user_id: agent_info_id,
          action: 'DECREASE',
          main_db_transaction_number: transaction_id,
          value_before: `${Math.floor(currentCredits * 100) / 100}`,
          value: `${Math.floor(amount * 100) / 100}`,
          value_after: `${wallet.credits}`,
          modified_by: +agent_info_id,
          created_by: +agent_info_id,
        },
      });
    } catch (e) {
      console.error('CoreBridge bet commission/history error:', e);
    }

    return { balance: wallet.credits };
  }

  async win(data: CallbackBody) {
    const { player_id, game_uuid, round_id, transaction_id } = data;
    const amount = parseFloat(data.amount);

    if (!transaction_id) return { error_code: 'MISSING_PARAM', error_description: 'transaction_id required' };

    let gameDetail: any = await Game.findOne({ where: { uuid: game_uuid } });
    if (!gameDetail) gameDetail = { id: 0 };
    const { id } = gameDetail;

    const wallet = await Wallet.findOne({ where: { userId: +player_id } });
    if (!wallet) return { error_code: 'PLAYER_NOT_FOUND', error_description: 'Player not found' };

    const currentCredits = wallet.credits;

    const gameRound = await GameRound.findOne({ where: { GAME_ID: +id, GAMEROUND: round_id } });
    if (!gameRound) {
      return { balance: wallet.credits };
    }

    const existingWin = await Bets.findOne({ where: { transaction_id } });
    if (existingWin) {
      return { balance: wallet.credits };
    }

    const totalBetAmount = await BetTransaction.sum('BET_AMOUNT', {
      where: { userId: +player_id, GAME_ID: +id, GAMEROUND_ID: +gameRound.ID },
    }) || 0;

    const netWin = +amount - +totalBetAmount;
    const oldBalance = wallet.credits;
    const newCredit = (+wallet.credits + +amount).toFixed(4);
    wallet.credits = +newCredit;
    if (+amount > 0) {
      wallet.withdrawable = +(+wallet.withdrawable + +amount).toFixed(4);
    }
    await wallet.save();

    await BetTransaction.update(
      { STATUS: 'COMPLETE' },
      { where: { GAME_ID: +id, GAMEROUND_ID: gameRound.ID } },
    );

    await Bets.create({
      gameId: id,
      transaction_id,
      userId: +player_id,
      gameRoundId: +gameRound.ID,
      turnover: +totalBetAmount,
      payout: +amount,
      returnBet: 0,
      netWin,
      event: netWin > 0 ? 'Win' : netWin === 0 ? 'Draw' : 'Lose',
      previousBalance: parseFloat(oldBalance) + totalBetAmount,
      newBalance: wallet.credits,
    });

    gameRound.STATUS = 'COMPLETE';
    await gameRound.save();

    WebSocketService.sendToClient(`${player_id}`, {
      channel: '/CreditUpdate',
      data: {
        credits: wallet.credits,
        withdrawable: parseFloat(wallet.withdrawable) || 0,
        message: 'Your credits have been updated successfully.',
        status: 'success',
      },
    });

    try {
      const agent_id = await getAgentId(player_id);
      const agent_info_id = +agent_id.data.data.id;

      const getBet = await BetTransaction.findOne({
        where: { userId: +player_id, GAME_ID: +id, GAMEROUND_ID: +gameRound.ID },
      });

      CreditHistory({
        data: {
          user_id: +agent_info_id,
          action: 'INCREASE',
          main_db_transaction_number: getBet?.TRANSACTION_ID || transaction_id,
          value_before: `${Math.floor(currentCredits * 100) / 100}`,
          value: `${Math.floor(amount * 100) / 100}`,
          value_after: `${wallet.credits}`,
          modified_by: +agent_info_id,
          created_by: +agent_info_id,
        },
      });

      CommissionDistribution({
        data: {
          game_type: gameDetail.provider || 'corebridge',
          user_id: agent_info_id,
          transaction_id: getBet?.TRANSACTION_ID || transaction_id,
          bet_transaction_id: getBet ? +getBet.ID : 0,
          bet_amount: `${getBet?.BET_AMOUNT || 0}`,
          turnover: `${totalBetAmount}`,
          payout: `${amount}`,
          net_win: `${netWin}`,
        },
      });
    } catch (e) {
      console.error('CoreBridge win commission/history error:', e);
    }

    return { balance: wallet.credits };
  }

  async refund(data: CallbackBody) {
    const { player_id, transaction_id, original_transaction_id, game_uuid } = data;
    const amount = parseFloat(data.amount);
    const refTxnId = original_transaction_id || data.bet_transaction_id;

    const wallet = await Wallet.findOne({ where: { userId: +player_id } });
    if (!wallet) return { error_code: 'PLAYER_NOT_FOUND', error_description: 'Player not found' };

    if (!refTxnId) {
      return { balance: wallet.credits };
    }

    let checkBet: any = await BetTransaction.findOne({ where: { TRANSACTION_ID: refTxnId } });
    if (!checkBet) {
      checkBet = await Bets.findOne({ where: { transaction_id: refTxnId } });
      if (!checkBet) return { balance: wallet.credits };
    }

    if (checkBet?.STATUS === 'CANCELLED' || checkBet?.status === 'CANCELLED') {
      return { balance: wallet.credits };
    }

    if (checkBet.STATUS) {
      checkBet.STATUS = 'CANCELLED';
    } else {
      checkBet.status = 'CANCELLED';
    }
    await checkBet.save();

    const newCredit = (+wallet.credits + +amount).toFixed(4);
    wallet.credits = +newCredit;
    await wallet.save();

    let gameDetail: any = await Game.findOne({ where: { uuid: game_uuid } });
    if (gameDetail) {
      const gameRound = await GameRound.findOne({
        where: { GAME_ID: +gameDetail.id, TRANSACTION_ID: refTxnId, STATUS: 'ONGOING' },
      });
      if (gameRound) {
        gameRound.STATUS = 'CANCELLED';
        await gameRound.save();
      }
    }

    return { balance: wallet.credits };
  }

  async rollback(data: CallbackBody) {
    const { player_id, transaction_id } = data;
    const refTxnId = data.original_transaction_id || transaction_id;

    const wallet = await Wallet.findOne({ where: { userId: +player_id } });
    if (!wallet) return { error_code: 'PLAYER_NOT_FOUND', error_description: 'Player not found' };

    const checkBet = await BetTransaction.findOne({ where: { TRANSACTION_ID: refTxnId } });
    if (!checkBet) return { balance: wallet.credits };

    if (checkBet.STATUS === 'ROLLBACK') {
      return { balance: wallet.credits };
    }

    const amount = parseFloat(String(checkBet.BET_AMOUNT));
    checkBet.STATUS = 'ROLLBACK';
    await checkBet.save();

    const newCredit = (+wallet.credits + +amount).toFixed(4);
    wallet.credits = +newCredit;
    await wallet.save();

    return { balance: wallet.credits };
  }
}

interface CallbackBody {
  action?: string;
  player_id?: any;
  amount?: any;
  currency?: any;
  game_uuid?: any;
  transaction_id?: any;
  original_transaction_id?: any;
  bet_transaction_id?: any;
  session_id?: any;
  round_id?: any;
  type?: any;
}
