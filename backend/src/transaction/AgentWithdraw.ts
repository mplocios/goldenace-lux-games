import { FastifyReply, FastifyRequest } from 'fastify';
import User from '../../models/User';
import Transaction from '../../models/Transaction';
import axios from 'axios';
import Wallet from '../../models/Wallet';
import { generateRandomString,DateToday } from '../utils/common';
import { generateSignature } from '../utils/sigepaySigniture';
import WebSocketService from "../services/WebSocketService";
import AgentTransaction from '../../models/AgentTransaction';

const sigepayUrl = process.env.SIGEPAY_URL || '';
const sigepaySecretKey = process.env.SIGEPAY_SECRET_KEY || '';
const sigepayApiKey = process.env.SIGEPAY_API_KEY || '';
const jwtSecret = process.env.JWT_SECRET_KEY || 'ToTheMoon__69420';

export async function agentWithdraw(req: FastifyRequest<{ Body: Params }>, res: FastifyReply) {
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
    const response = await processWithdraw({
      token: decoded,
      amount, bankCode, accountNo, firstName, middleName, lastName
    });
   return response
  } catch (e) {
    console.error('Error during withdrawal:', e);
    // return res.code(500).send({ message: 'Error processing withdrawal', error: e.message });
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


async function processWithdraw({token,amount, bankCode, accountNo, firstName, middleName, lastName}){
  const {id} = token
  const fullname = `${firstName} ${middleName} ${lastName}`
    if(+amount <= 199){
      return "Amount of payout is lower the minimum limit of 200.00"
    }
    if(id){
        const wallet = await Wallet.findOne({
          where: { agent_db_user_id: id }
        });

        const orderNumber = `${id}${generateRandomString(7)}${DateToday()}`
      
        const payouts = [
          {
            bank_code: bankCode.toUpperCase(),
            account_no: accountNo,
            amount: amount.toFixed(2),
            first_name: firstName,
            middle_name: middleName || '',
            last_name: lastName,
          },
        ];

        const payload = {
          m_key_id: sigepayApiKey,
          m_batch_no: orderNumber,
          m_callback_url: `${process.env.SIGEPAY_STATUS_CALLBACK}` || '', 
          payouts,
        };
        const new_amount = wallet.agent_db_credits - +amount
    
      //cancel transaction if negative
      
        const  previousBalance = wallet.agent_db_credits
        const  newBalance = wallet.agent_db_credits - amount
        if(newBalance < 0){
          return "Insufficient Balance"
        }
        
        wallet.agent_db_credits = newBalance
      
      
        console.log("new wallet credit : ", wallet.agent_db_credits )
        const signature = await generateSignature(payload, sigepaySecretKey);
        Object.assign(payload, { signature });

        const transaction = await AgentTransaction.create({
          userId : id,
          amount,
          channel: bankCode.toUpperCase(),
          event: 'withdraw',
          orderNumber,
          previousBalance,
          newBalance,
          status :'processing',
          meta :  null,
          remarks :  null,
          send_to_name : fullname,
          send_to_acc_num : accountNo
        });
        await wallet.save()
      
        // WebSocketService.sendToClient(`${wallet.userId}`, {
        //   channel:  "/CreditUpdate",
        //   data: {
        //     credits: new_amount,  // Send the updated credits
        //     message: "Your credits have been updated.",
        //     status: "pending" 
        //   }
        // });
      
        // const response = await axios.post(`${sigepayUrl}/payout/order`, payload, {
        //   headers: { 'Content-Type': 'application/json' },
        // });
        // if(!response) await cancelWithdraw(response,transaction,wallet,amount)
        // if (response.status !== 200) await cancelWithdraw(response,transaction,wallet,amount)

        const responses = {
          message: 'Withdrawal request successful',
          transactionId: transaction.id,
          // status : response.data.status || 'processing',
          status :  'processing',
        }; 
        // if(response.data.status == 'success'){
    
          Object.assign(responses, {new_credits : wallet.dataValues.credits})
          
        // }
      
        return responses
  
    }
    else{
      throw "Incorrect Token"
    }
 

}

async function cancelWithdraw(response,transaction,wallet,amount){
  transaction.status = "cancelled"
  transaction.remarks = "there is something wrong with the payment gateway"
  transaction.meta = JSON.stringify(response.data)

  await transaction.save()

  wallet.credits =  wallet.credits + amount
  await wallet.save()
  WebSocketService.sendToClient(`${wallet.userId}`, {
    channel:  "/CreditUpdate",
    data: {
      credits: wallet.credits,  // Send the updated credits
      message: "Your credits have been updated.",
      status: "cancelled" 
    }
  });

  
  throw response;
}