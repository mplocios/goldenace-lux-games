import { FastifyReply, FastifyRequest } from "fastify";
import User from "../../models/User";
import Transaction from "../../models/Transaction";
import { generateRandomString,DateToday } from "../utils/common";
import { generateSignature } from "../utils/sigepaySigniture";
import Wallet from "../../models/Wallet";
import axios from "axios";

const sigepayUrl = process.env.SIGEPAY_URL || '';
const sigepaySecretKey = process.env.SIGEPAY_SECRET_KEY || '';
const sigepayApiKey = process.env.SIGEPAY_API_KEY || '';
const jwtSecret = process.env.JWT_SECRET_KEY || 'ToTheMoon__69420';

export async function deposit(req: FastifyRequest<{ Body: Params }>, res: FastifyReply) {
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

    const response = await processDeposit({
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


async function processDeposit({token,amount,paymentType}){
  try{
    const {mobile_number} = token
    console.log(token)
    if(mobile_number){

      let user_detail = await User.findOne({ where: {mobile : mobile_number } });

      if (!user_detail) throw { message: "User not found" };

      const orderNumber = `${user_detail.id}${generateRandomString(5)}${DateToday()}`
      console.log({token,amount,test : paymentType || 'missing' })
      const payload = {
        m_key_id: sigepayApiKey,
        m_method: paymentType.toUpperCase(),
        m_currency: "PHP",
        m_amount: amount.toFixed(2),
        m_order_no: orderNumber,
        m_callback_url: `${process.env.SIGEPAY_STATUS_CALLBACK}` || '', 
        m_success_url : `${process.env.SIGEPAY_PAYMENT_SUCCESS_REDIRECT}` || '',  // optional success redirect if want to redirect to somewhere 
        m_cancel_url :  `${process.env.SIGEPAY_PAYMENT_SUCCESS_REDIRECT}` || '' ,
        m_failure_url : `${process.env.SIGEPAY_PAYMENT_SUCCESS_REDIRECT}` || '' 
      };


      
      const signature = await generateSignature(payload, sigepaySecretKey);
      Object.assign(payload,{signature})
    
      // Make the API call
      console.log(payload,5123)
      const response = await axios.post(`${sigepayUrl}/payment/order`, payload);
      
      if (response.status !== 200) {
          throw response;
      }
      const wallet = await Wallet.findOne({
        where: { userId: user_detail.id }
      });
          // Successfully generates a payment link URL
      const paymentUrl = response.data.response.url;
   
      const  previousBalance = wallet.credits
      const  newBalance = +wallet.credits + amount

      const transaction = await Transaction.create({
        userId : user_detail.id,
        amount,
        channel: paymentType.toUpperCase(),
        event: 'deposit',
        previousBalance,
        newBalance,
        orderNumber,
        status: response.data.status || 'processing'
      });
      
      const responses = {
        message: 'Deposit successful',
        transactionId: transaction.id,
        status : response.data.status || 'processing',
        paymentUrl
      }; 

      if(response.data.status == 'success'){

  
    
        Object.assign(responses, {new_credits : wallet.dataValues.credits})
        
      }
      return responses
    }else{
        throw "Incorrect Token"
    }
  }catch(e){
 
    throw e
  }
 
}
 

class Params {
  amount: number;
  paymentType : string;
}
