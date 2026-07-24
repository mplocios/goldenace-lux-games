import { FastifyReply, FastifyRequest } from 'fastify';
import axios from 'axios';
import User from '../../../models/User';
import Transaction from '../../../models/Transaction';
import Wallet from '../../../models/Wallet';
import WebSocketService from '../../services/WebSocketService';
import getAgentId from '../../services/AgenDbId';
import CreditHistory from '../../services/CreditHistory';
import { KADAPAY_BASE_URL, KADAPAY_CALLBACK_URL } from './config';
import { buildAuthHeaders } from './sign';

const BANK_CODE_MAP: Record<string, string> = {
  gcash: 'GXCHPHM2XXX',
  maya: 'PAPHPHM1XXX',
};

export async function kadaCashout(req: FastifyRequest<{ Body: CashoutParams }>, res: FastifyReply) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.headers['token'] as string;
    if (!token) return res.code(400).send({ error: 'Token is missing' });

    const decoded: any = req.server.jwt.verify(token);
    const { amount, bankCode, accountNo, firstName, middleName, lastName } = req.body;

    if (+amount < 100) return res.code(400).send({ error: 'Minimum withdrawal is 100' });

    const user = await User.findOne({ where: { mobile: decoded.mobile_number } });
    if (!user) return res.code(404).send({ error: 'User not found' });

    const wallet = await Wallet.findOne({ where: { userId: user.id } });
    if (+amount > (+wallet.withdrawable || 0)) {
      return res.code(400).send({ error: 'Insufficient withdrawable balance' });
    }

    const orderId = `KADAW${Date.now()}`;
    const fullname = [firstName, middleName, lastName].filter(Boolean).join(' ');
    const resolvedBankCode = BANK_CODE_MAP[bankCode?.toLowerCase()] || bankCode || 'GXCHPHM2XXX';

    const body = {
      amount: Number(Number(amount).toFixed(2)),
      bankAccountName: fullname,
      bankAccountNumber: accountNo,
      bankCode: resolvedBankCode,
      ref: orderId,
      callbackUrl: KADAPAY_CALLBACK_URL,
    };

    const headers = buildAuthHeaders(body);
    console.log('[KADAPAY-CASHOUT] Request:', JSON.stringify(body));

    const response = await axios.post(`${KADAPAY_BASE_URL}/api/mcht/disbursement/create`, JSON.stringify(body), {
      headers,
    });
    console.log('[KADAPAY-CASHOUT] Response:', JSON.stringify(response.data));

    const data = response.data;
    if (!data.success) {
      throw new Error(data.message || 'KadaPay cashout failed');
    }

    const previousBalance = wallet.credits;
    const newBalance = +wallet.credits - +amount;
    if (newBalance < 0) return res.code(400).send({ error: 'Insufficient balance' });

    wallet.credits = newBalance;
    wallet.withdrawable = +(+wallet.withdrawable - +amount).toFixed(4);
    await wallet.save();

    const transaction = await Transaction.create({
      userId: user.id,
      amount,
      channel: `KADA_${resolvedBankCode}`,
      event: 'withdraw',
      previousBalance,
      newBalance,
      orderNumber: orderId,
      status: 'processing',
      meta: JSON.stringify({ provider: 'kadapay', txid: data.data?.txid || '' }),
      send_to_name: fullname,
      send_to_acc_num: accountNo,
    });

    WebSocketService.sendToClient(`${wallet.userId}`, {
      channel: '/CreditUpdate',
      data: {
        credits: newBalance,
        withdrawable: parseFloat(wallet.withdrawable) || 0,
        message: 'Your credits have been updated.',
        status: 'success',
      },
    });

    try {
      const agentId = await getAgentId(transaction.userId);
      CreditHistory({
        data: {
          user_id: agentId,
          action: 'DECREASE',
          main_db_transaction_number: transaction.orderNumber,
          value_before: `${previousBalance}`,
          value: `${amount}`,
          value_after: `${newBalance}`,
          modified_by: +agentId,
          created_by: +agentId,
        },
      });
    } catch (e) {
      console.error('[KADAPAY-CASHOUT] CreditHistory error:', e);
    }

    return res.send({
      message: 'Withdrawal request successful',
      transactionId: transaction.id,
      status: 'processing',
      new_credits: wallet.credits,
    });
  } catch (e: any) {
    console.error('[KADAPAY-CASHOUT] Error:', e?.response?.data || e.message);
    return res.code(500).send({ error: e?.response?.data?.message || e.message || 'KadaPay cashout failed' });
  }
}

interface CashoutParams {
  amount: number;
  bankCode?: string;
  accountNo: string;
  firstName: string;
  middleName?: string;
  lastName: string;
}
