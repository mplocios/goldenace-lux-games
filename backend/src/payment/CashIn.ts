import { FastifyReply, FastifyRequest } from "fastify";
import User from "../../models/User";
import Transaction from "../../models/Transaction";
import Wallet from "../../models/Wallet";
import axios from "axios";

const paymentURL = process.env.PAYMENT_URL || '';
const paymentAPIUsername = process.env.PAYMENT_API_USERNAME || '';
const paymentAPIPassword = process.env.PAYMENT_API_PASSWORD || '';
const paymentAPIKey = process.env.PAYMENT_API_KEY || '';
const URL = process.env.URL || '';

export async function cashin(req: FastifyRequest<{ Body: Params }>, res: FastifyReply) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.headers['token'] as string;
    const { price, coins, paymentType } = req.body;

    if (!token) {
      return res.code(400).send({ error: "Token is missing" });
    }

    const decoded: any = req.server.jwt.verify(token);

    const response = await processCashIn({
      token: decoded,
      price,
      coins,
      paymentType,
    });

    return res.code(200).send(response);
  } catch (e: any) {
    console.error("Error in cashin controller:", e);
    const errorResponse = e.response?.data || { error: e.message || "An error occurred" };
    return res.code(500).send(errorResponse);
  }
}

async function processCashIn({ token, price, coins, paymentType }: any) {
  const { mobile_number } = token;

  if (!mobile_number) {
    throw { message: "Invalid token" };
  }

  const user_detail = await User.findOne({ where: { mobile: mobile_number } });
  if (!user_detail) throw { message: "User not found" };

  const timestamp = +new Date();
  const order_id = `KFSHR${timestamp}`;

  const payload = {
    amount: price,
    bank_code: paymentType.toLowerCase(),
    order_id,
    payment_type: "1",
    return_url: `${URL}/wallet`,
    callback_url: `${URL}/api/payments/callback`,
  };

  const headers = {
    'X-API-KEY': paymentAPIKey,
    'X-API-USERNAME': paymentAPIUsername,
    'X-API-PASSWORD': paymentAPIPassword,
  };

  console.log("[CASHIN] Sending to Digiluck:", JSON.stringify(payload));
  const response = await axios.post(`${paymentURL}/cashin`, payload, { headers });
  console.log("[CASHIN] Digiluck response:", JSON.stringify(response.data));
  if (response.data.status !== true) throw response.data;

  const wallet = await Wallet.findOne({ where: { userId: user_detail.id } });
  const previousBalance = wallet.credits;
  const newBalance = +wallet.credits + coins;

  const transaction = await Transaction.create({
    userId: user_detail.id,
    amount: coins,
    channel: paymentType.toUpperCase(),
    event: 'deposit',
    previousBalance,
    newBalance,
    orderNumber: order_id,
    status: 'processing',
    meta: JSON.stringify({ price, coins }),
  });

  return {
    message: 'Deposit initiated',
    transactionId: transaction.id,
    status: 'processing',
    amount: coins,
    paymentUrl: response.data.redirect_url,
  };
}

class Params {
  price: number;
  coins: number;
  paymentType: string;
}
