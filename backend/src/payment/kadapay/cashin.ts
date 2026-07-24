import { FastifyReply, FastifyRequest } from 'fastify';
import axios from 'axios';
import User from '../../../models/User';
import Transaction from '../../../models/Transaction';
import Wallet from '../../../models/Wallet';
import { KADAPAY_BASE_URL, KADAPAY_CALLBACK_URL, KADAPAY_SUCCESS_URL } from './config';
import { buildAuthHeaders } from './sign';

const PM_MAP: Record<string, string> = {
  gcash: 'GCASH',
  maya: 'MAYA',
  qrph: 'QRPH',
};

export async function kadaCashin(req: FastifyRequest<{ Body: CashinParams }>, res: FastifyReply) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.headers['token'] as string;
    if (!token) return res.code(400).send({ error: 'Token is missing' });

    const decoded: any = req.server.jwt.verify(token);
    const { price, coins, paymentType } = req.body;

    const user = await User.findOne({ where: { mobile: decoded.mobile_number } });
    if (!user) return res.code(404).send({ error: 'User not found' });

    const wallet = await Wallet.findOne({ where: { userId: user.id } });
    const orderId = `KADA${Date.now()}`;
    const pm = PM_MAP[paymentType?.toLowerCase()] || paymentType?.toUpperCase() || 'GCASH';

    const body = {
      amount: Number(Number(price).toFixed(2)),
      pm,
      ref: orderId,
      payer: {
        email: `${user.mobile}@goldenace.ph`,
        name: user.name || user.mobile,
        phone: user.mobile,
      },
      redirect: KADAPAY_SUCCESS_URL,
      callbackUrl: KADAPAY_CALLBACK_URL,
    };

    const headers = buildAuthHeaders(body);
    console.log('[KADAPAY-CASHIN] Request:', JSON.stringify(body));

    const response = await axios.post(`${KADAPAY_BASE_URL}/api/mcht/payment/submit`, JSON.stringify(body), {
      headers,
    });
    console.log('[KADAPAY-CASHIN] Response:', JSON.stringify(response.data));

    const data = response.data;
    if (!data.success) {
      throw new Error(data.message || 'KadaPay cashin failed');
    }

    const payData = data.data;

    await Transaction.create({
      userId: user.id,
      amount: coins,
      channel: `KADA_${pm}`,
      event: 'deposit',
      previousBalance: wallet.credits,
      newBalance: +wallet.credits + +coins,
      orderNumber: orderId,
      status: 'processing',
      meta: JSON.stringify({ provider: 'kadapay', txid: payData.txid || '', price }),
    });

    return res.send({
      message: 'Deposit initiated',
      status: 'processing',
      amount: coins,
      paymentUrl: payData.paymentUrl || '',
    });
  } catch (e: any) {
    console.error('[KADAPAY-CASHIN] Error:', e?.response?.data || e.message);
    return res.code(500).send({ error: e?.response?.data?.message || e.message || 'KadaPay cashin failed' });
  }
}

interface CashinParams {
  price: number;
  coins: number;
  paymentType: string;
}
