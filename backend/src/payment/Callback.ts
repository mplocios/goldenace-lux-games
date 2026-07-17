import { FastifyReply, FastifyRequest } from "fastify";
import User from "../../models/User";
import Transaction from "../../models/Transaction";
import Wallet from "../../models/Wallet";
import axios from "axios";
import WebSocketService from "../services/WebSocketService";
import CreditHistory from "../services/CreditHistory"
import getAgentId from "../services/AgenDbId";

const paymentURL = process.env.PAYMENT_URL || '';
const paymentAPIUsername = process.env.PAYMENT_API_USERNAME || '';
const paymentAPIPassword = process.env.PAYMENT_API_PASSWORD || '';
const paymentAPIKey = process.env.PAYMENT_API_KEY || '';
const URL = process.env.URL || '';

const jwtSecret = process.env.JWT_SECRET_KEY || 'ToTheMoon__69420';

export async function callback(req: FastifyRequest<{Body : RequestParams }> , res: FastifyReply) {
  try {
    const body = req.body
    const param = req.params
    console.log("body : ", body)
    console.log('param : ', param)
    const {status,message,order_id,data} = req.body

    const transaction = await Transaction.findOne({
      where : {
        orderNumber : order_id,
        status : "processing"
      }
    })
 
    if(!transaction) {
 
      throw {error_code : 404 , message : "Transaction not found." }
    }
    if(!status){
      transaction.status = "failed"
      transaction.remarks = message

      if(transaction.event == "withdraw"){
        // await processWithdraw(transaction,status)
      }
  
      throw {error_code : 401 , message}

    }
    if(transaction.event == "deposit"){
      await processDeposit(transaction)

      transaction.status = "success"
      transaction.save()
    }
   
    return
  } catch (e) {
    console.log(e)
    return { error_code : e.code , message : e.message}
  }
}
 

async function processDeposit(transaction){
 
  const wallet = await Wallet.findOne({
    where : {
      userId : transaction.userId
    }
  })
 
  if(!wallet) {
    throw {error_code : 404 , message : "Wallet not found." }
  }
 
  const credit =  parseFloat(wallet.credits)
  const newBalance = credit + +transaction.amount
 
  wallet.credits = newBalance

  wallet.save() 
  let agent_id = transaction.userId

  if(transaction.remarks!="agent"){
    agent_id  = await getAgentId(transaction.userId)
  }

  const request = {
    data :{
      // game_type : 'pragmatic',
      user_id : agent_id,
      action : 'INCREASE',
      main_db_transaction_number : transaction.orderNumber,
      value_before : `${credit}`,
      value : `${transaction.amount}`,
      value_after: `${newBalance}`,
      modified_by :+agent_id,
      created_by :+agent_id
    }
  }
    
  CreditHistory(request)
  
  WebSocketService.sendToClient(`${wallet.userId}`, {
    channel:  "/CreditUpdate",
    data: {
      credits: wallet.credits,
      withdrawable: parseFloat(wallet.withdrawable) || 0,
      message: "Your credits have been updated successfully.",
      status: 'success'
    }
  });
  console.log( {
    credits: wallet.credits,  // Send the updated credits
    message: "Your credits have been updated successfully.",
    status: 'success'
  })

}

interface RequestParams {
  status? : boolean;
  message? : string;
  order_id? : string;
  data? : any
}