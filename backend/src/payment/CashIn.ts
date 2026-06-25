import { FastifyReply, FastifyRequest } from "fastify";
import User from "../../models/User";
import Transaction from "../../models/Transaction";
import { generateRandomString,DateToday } from "../utils/common";
import { generateSignature } from "../utils/sigepaySigniture";
import Wallet from "../../models/Wallet";
import axios from "axios";

const paymentURL = process.env.PAYMENT_URL || '';
const paymentAPIUsername = process.env.PAYMENT_API_USERNAME || '';
const paymentAPIPassword = process.env.PAYMENT_API_PASSWORD || '';
const paymentAPIKey = process.env.PAYMENT_API_KEY || '';
const URL = process.env.URL || '';

const jwtSecret = process.env.JWT_SECRET_KEY || 'ToTheMoon__69420';

export async function cashin(req: FastifyRequest<{ Body: Params }>, res: FastifyReply) {
  try {
    const { token } = req.headers;
    const { amount, paymentType } = req.body;

    if (!token) {
      return res.code(400).send({ error: "Token is missing" });
    }

    const decoded = await new Promise((resolve, reject) => {
      this.jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
          reject(new Error("Token is invalid or expired."));
        } else {
          resolve(decoded);
        }
      });
    });

    const response = await processCashIn({
      token: decoded,
      amount,
      paymentType,
    });

    return res.code(200).send(response);
  } catch (e) {
    console.error("Error in deposit controller:", e);
    const errorResponse = e.response?.data || { error: e.message || "An error occurred" };
    return res.code(500).send(errorResponse);
  }
}

async function processCashIn({token,amount,paymentType}){

  try{
    const {mobile_number} = token
 
    if(mobile_number){

      let user_detail = await User.findOne({ where: {mobile : mobile_number } });

      if (!user_detail) throw { message: "User not found" };
      
      const date = new Date();
      const timestamp = +date;  

      const order_id = `KFSHR${timestamp}`

   

      const payload = {
        amount,
        bank_code: paymentType.toLowerCase(),
        order_id,
        payment_type: "1",
        return_url: URL,
        callback_url: `${URL}/api/payments/callback`, 
        // mobile_number
      }

      const headers = {
        'X-API-KEY': paymentAPIKey,
        'X-API-USERNAME': paymentAPIUsername,
        'X-API-PASSWORD': paymentAPIPassword,
      };
  
      const response = await axios.post(`${paymentURL}/cashin`, payload, { headers });
      console.log(response?.data)
      if (response.data.status !== true)  throw response.data;

      const wallet = await Wallet.findOne({
        where: { userId: user_detail.id }
      });
     
      const  previousBalance = wallet.credits
      const  newBalance = +wallet.credits + amount

      const transaction = await Transaction.create({
        userId : user_detail.id,
        amount,
        channel: paymentType.toUpperCase(),
        event: 'deposit',
        previousBalance,
        newBalance,
        orderNumber : order_id,
        status: 'processing'
      });
      
      const responses = {
        message: 'Deposit successful',
        transactionId: transaction.id,
        status : 'processing',
        amount,
        paymentUrl : response.data.redirect_url
      }; 

      return responses
    }
  }
  catch(e){
 
    return { error_code : e.code , message : e.message}

  }
}


class Params {
  amount: number;
  paymentType : string;
}
