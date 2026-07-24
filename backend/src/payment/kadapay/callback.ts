import { FastifyReply, FastifyRequest } from 'fastify';
import Transaction from '../../../models/Transaction';
import Wallet from '../../../models/Wallet';
import WebSocketService from '../../services/WebSocketService';
import CreditHistory from '../../services/CreditHistory';
import getAgentId from '../../services/AgenDbId';
import { verifyCallbackSignature } from './sign';

export async function kadaCallback(req: FastifyRequest, res: FastifyReply) {
  try {
    const body = req.body as Record<string, any>;
    const rawBody = JSON.stringify(body);
    console.log('[KADAPAY-CB] Received:', rawBody);

    const signature = req.headers['signature'] as string;
    const requestTime = req.headers['request-time'] as string;

    if (!verifyCallbackSignature(body, signature, requestTime)) {
      console.warn('[KADAPAY-CB] Invalid signature');
      return res.code(400).send('FAIL');
    }

    const ref = body.ref;
    const status = body.status;
    const type = body.type;

    if (!ref) {
      console.warn('[KADAPAY-CB] Missing ref');
      return res.code(400).send('FAIL');
    }

    const transaction = await Transaction.findOne({
      where: { orderNumber: ref, status: 'processing' },
    });

    if (!transaction) {
      console.log('[KADAPAY-CB] Transaction not found or already processed:', ref);
      return res.send('SUCCESS');
    }

    if (status === 'PAID' || status === 'COMPLETE') {
      if (transaction.event === 'deposit') {
        await processDeposit(transaction);
      }
      transaction.status = 'success';
      transaction.remarks = status;
      await transaction.save();
      console.log('[KADAPAY-CB] Success:', ref, transaction.event);
    } else if (status === 'FAILED') {
      if (transaction.event === 'withdraw') {
        await refundWithdrawal(transaction);
      }
      transaction.status = 'failed';
      transaction.remarks = 'failed';
      await transaction.save();
      console.log('[KADAPAY-CB] Failed:', ref);

      WebSocketService.sendToClient(`${transaction.userId}`, {
        channel: '/CreditUpdate',
        data: {
          message: 'Payment failed.',
          status: 'failed',
        },
      });
    }

    return res.send('SUCCESS');
  } catch (e: any) {
    console.error('[KADAPAY-CB] Error:', e);
    return res.code(500).send('FAIL');
  }
}

async function processDeposit(transaction: any) {
  const wallet = await Wallet.findOne({ where: { userId: transaction.userId } });
  if (!wallet) throw new Error('Wallet not found');

  const credit = parseFloat(wallet.credits);
  const newBalance = credit + +transaction.amount;

  wallet.credits = newBalance;
  await wallet.save();

  try {
    let agentId = transaction.userId;
    if (transaction.remarks !== 'agent') {
      agentId = await getAgentId(transaction.userId);
    }

    CreditHistory({
      data: {
        user_id: agentId,
        action: 'INCREASE',
        main_db_transaction_number: transaction.orderNumber,
        value_before: `${credit}`,
        value: `${transaction.amount}`,
        value_after: `${newBalance}`,
        modified_by: +agentId,
        created_by: +agentId,
      },
    });
  } catch (e) {
    console.error('[KADAPAY-CB] CreditHistory error:', e);
  }

  WebSocketService.sendToClient(`${wallet.userId}`, {
    channel: '/CreditUpdate',
    data: {
      credits: wallet.credits,
      withdrawable: parseFloat(wallet.withdrawable) || 0,
      message: 'Your credits have been updated successfully.',
      status: 'success',
    },
  });
}

async function refundWithdrawal(transaction: any) {
  const wallet = await Wallet.findOne({ where: { userId: transaction.userId } });
  if (!wallet) return;

  wallet.credits = +wallet.credits + +transaction.amount;
  wallet.withdrawable = +(+wallet.withdrawable + +transaction.amount).toFixed(4);
  await wallet.save();

  WebSocketService.sendToClient(`${wallet.userId}`, {
    channel: '/CreditUpdate',
    data: {
      credits: wallet.credits,
      withdrawable: parseFloat(wallet.withdrawable) || 0,
      message: 'Withdrawal failed. Credits refunded.',
      status: 'refund',
    },
  });
}
