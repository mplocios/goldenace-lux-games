import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import Wallet from '../../models/Wallet';
import Transaction from '../../models/Transaction';
import WebSocketService from '../services/WebSocketService';
import { generateRandomString, DateToday } from '../utils/common';

let app: FastifyInstance;

export class DepositWithdrawController {
  static async init(fastify: FastifyInstance) {
    app = fastify;
    fastify.post('/deposit', deposit);
    fastify.post('/withdraw', withdraw);
  }
}

interface TxBody {
  amount: number;
  channel?: string;
}

async function deposit(req: FastifyRequest<{ Body: TxBody }>, res: FastifyReply) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.code(401).send({ message: 'Unauthorized' });
  }
  let decoded: any;
  try {
    decoded = app.jwt.verify(authHeader.split(' ')[1]);
  } catch {
    return res.code(401).send({ message: 'Invalid token' });
  }

  const userId = decoded.id;
  const amount = parseFloat(String(req.body.amount));
  if (!amount || amount <= 0) {
    return res.code(400).send({ message: 'Invalid amount' });
  }

  const wallet = await Wallet.findOne({ where: { userId } });
  if (!wallet) return res.code(404).send({ message: 'Wallet not found' });

  const previousBalance = parseFloat(wallet.credits);
  const newBalance = +(previousBalance + amount).toFixed(4);
  wallet.credits = newBalance;
  await wallet.save();

  const orderNumber = `${userId}${generateRandomString(7)}${DateToday()}`;
  await Transaction.create({
    userId,
    amount,
    channel: (req.body.channel || 'ONLINE').toUpperCase(),
    event: 'deposit',
    orderNumber,
    previousBalance,
    newBalance,
    status: 'success',
    meta: null,
    remarks: null,
  });

  WebSocketService.sendToClient(`${userId}`, {
    channel: '/CreditUpdate',
    data: { credits: newBalance, message: 'Deposit successful.', status: 'success' },
  });

  return res.send({ balance: newBalance, withdrawable: parseFloat(wallet.withdrawable) || 0 });
}

async function withdraw(req: FastifyRequest<{ Body: TxBody }>, res: FastifyReply) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.code(401).send({ message: 'Unauthorized' });
  }
  let decoded: any;
  try {
    decoded = app.jwt.verify(authHeader.split(' ')[1]);
  } catch {
    return res.code(401).send({ message: 'Invalid token' });
  }

  const userId = decoded.id;
  const amount = parseFloat(String(req.body.amount));
  if (!amount || amount <= 0) {
    return res.code(400).send({ message: 'Invalid amount' });
  }

  const wallet = await Wallet.findOne({ where: { userId } });
  if (!wallet) return res.code(404).send({ message: 'Wallet not found' });

  const previousBalance = parseFloat(wallet.credits);
  const withdrawable = parseFloat(wallet.withdrawable) || 0;
  if (amount > withdrawable) {
    return res.code(400).send({ message: 'Insufficient withdrawable balance' });
  }

  const newBalance = +(previousBalance - amount).toFixed(4);
  wallet.credits = newBalance;
  wallet.withdrawable = +(withdrawable - amount).toFixed(4);
  await wallet.save();

  const orderNumber = `${userId}${generateRandomString(7)}${DateToday()}`;
  await Transaction.create({
    userId,
    amount,
    channel: (req.body.channel || 'ONLINE').toUpperCase(),
    event: 'withdraw',
    orderNumber,
    previousBalance,
    newBalance,
    status: 'success',
    meta: null,
    remarks: null,
  });

  WebSocketService.sendToClient(`${userId}`, {
    channel: '/CreditUpdate',
    data: { credits: newBalance, message: 'Withdrawal successful.', status: 'success' },
  });

  return res.send({ balance: newBalance, withdrawable: parseFloat(wallet.withdrawable) || 0 });
}
