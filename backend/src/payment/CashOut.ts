import { FastifyReply, FastifyRequest } from "fastify";
import User from "../../models/User";
import Transaction from "../../models/Transaction";
import { generateRandomString,DateToday } from "../utils/common";
import { generateSignature } from "../utils/sigepaySigniture";
import Wallet from "../../models/Wallet";
import axios from "axios";
import WebSocketService from "../services/WebSocketService";
import getAgentId from "../services/AgenDbId";
import CreditHistory from "../services/CreditHistory";

const paymentURL = process.env.PAYMENT_URL || '';
const paymentAPIUsername = process.env.PAYMENT_API_USERNAME || '';
const paymentAPIPassword = process.env.PAYMENT_API_PASSWORD || '';
const paymentAPIKey = process.env.PAYMENT_API_KEY || '';
const URL = process.env.URL || '';

const jwtSecret = process.env.JWT_SECRET_KEY || 'ToTheMoon__69420';

export async function cashout(req: FastifyRequest<{ Body: Params }>, res: FastifyReply) {
  try {
    const { token } = req.headers;
    const {  amount, bankCode, accountNo, firstName, middleName, lastName } = req.body;

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

    const response = await processCashOut({
      token: decoded,
      amount, 
      bankCode,
      accountNo, 
      firstName, 
      middleName, 
      lastName
    });

    return res.code(200).send(response);
  } catch (e) {
    console.error("Error in deposit controller:", e);
    const errorResponse = e.response?.data || { error: e.message || "An error occurred" };
    return res.code(500).send(errorResponse);
  }
}

async function processCashOut({token,amount, bankCode, accountNo, firstName, middleName, lastName}){
  const {mobile_number} = token
  const fullname = `${firstName} ${middleName} ${lastName}`
    if(+amount < 100){
      return "Amount of payout is lower the minimum limit of 100.00"
    }
    if(mobile_number){
      
      let user_detail = await User.findOne({ where: {mobile : mobile_number } });

      if (!user_detail) throw { message: "User not found" };

      const wallet = await Wallet.findOne({
        where: { userId: user_detail.id }
      });

      if(amount>wallet.credits){
        throw { message: "Not enough balance." };
      }

      const date = new Date();
      const timestamp = +date;  

      const order_id = `KFSHR${timestamp}`
    
      const payload =  {
        amount,
        bank_code: bankCode.toLowerCase(),
        order_id,
        payment_type: "1",
        callback_url: `${URL}/api/payment/callback`, 
        mobile_number : accountNo
      }

      const headers = {
        'X-API-KEY': paymentAPIKey,
        'X-API-USERNAME': paymentAPIUsername,
        'X-API-PASSWORD': paymentAPIPassword,
      };
  
      const response = await axios.post(`${paymentURL}/cashout`, payload, { headers });
      const new_amount = wallet.credits - +amount
      console.log(response?.data)
      //cancel transaction if negative
      if (response.data.status !== true)  throw response.data;

        const  previousBalance = wallet.credits
        const  newBalance = wallet.credits - amount
        if(newBalance < 0){
          return "Insufficient Balance"
        }
        
        wallet.credits = newBalance

        const transaction = await Transaction.create({
          userId : user_detail.id,
          amount,
          channel: bankCode.toUpperCase(),
          event: 'withdraw',
          orderNumber : order_id,
          previousBalance,
          newBalance,
          status :'success',
          meta :  null,
          remarks :  response?.data?.message || null,
          send_to_name : fullname,
          send_to_acc_num : accountNo
        });
        await wallet.save()
      
        WebSocketService.sendToClient(`${wallet.userId}`, {
          channel:  "/CreditUpdate",
          data: {
            credits: new_amount,  // Send the updated credits
            message: "Your credits have been updated.",
            status: "success" 
          }
        });
        const responses = {
          message: 'Withdrawal request successful',
          transactionId: transaction.id,
          status :  'processing',
        }; 


        let agent_id = await getAgentId(transaction.userId)
         
        const request = {
          data :{
            // game_type : 'pragmatic',
            user_id : agent_id,
            action : 'DECREASE',
            main_db_transaction_number : transaction.orderNumber,
            value_before : `${previousBalance}`,
            value : `${amount}`,
            value_after: `${new_amount}`,
            modified_by :+agent_id,
            created_by :+agent_id
          }
        }
        CreditHistory(request)
        Object.assign(responses, {new_credits : wallet.dataValues.credits})
        return responses
  
    }
    else{
      throw "Incorrect Token"
    }
}


class Params {
  userId: number;
  amount: number;
  bankCode: string;
  accountNo: string;
  firstName: string;
  middleName?: string;
  lastName: string;
}
