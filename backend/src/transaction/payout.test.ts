import { FastifyReply, FastifyRequest } from "fastify";
import Wallet from "../../models/Wallet";
import WebSocketService from "../services/WebSocketService";

export async function PayoutTest(req: FastifyRequest<{ Body: Params }>, res: FastifyReply) {
  try {
    const { 
      m_key_id,
      m_batch_no,
      m_callback_url, 
      payouts 
    } = req.body;

    const msg = payouts[0].amount < 1000 ? "Amount of payout is lower the minimum limit of 1,000.00" : 
       payouts[0].amount > 50000 ? "Amount of payout is above the maximum limit of 50,000.00" : "ok"
    const sample_response = {
      m_batch_no: m_batch_no,  
      m_status: msg == "ok" ? "success" : "failed",  
      m_status_code: msg == "ok" ? 200 : 400,  
      m_message: msg, 
      signature: "some_signature_string",   
      payouts
    };

    let userId = m_batch_no.slice(0, m_batch_no.length - 11);  
    if(msg == "ok"){

      const wallet = await Wallet.findOne({
        where: { userId: userId }
      });
      if(wallet.dataValues.credits < payouts.amount){
        sample_response.m_message = "User Insufficient Credits"
        sample_response.m_status = "failed"
      }
      else{

        const amount = parseFloat(payouts[0].amount);

        const credit =  parseFloat(wallet.credits)
        const newBalance = +credit - +amount
        wallet.credits = newBalance;  // Add the amount to credits
        await wallet.save();

        WebSocketService.sendToClient(userId, {
          channel:  "/CreditUpdate",
          data: {
            credits: wallet.credits,  // Send the updated credits
            message: "Your credits have been updated successfully.",
          }
        });
      }

    }
   
    return res.send({
      message: sample_response.m_message,
      status: sample_response.m_status,
      received_data: sample_response,
    });
  } catch (e) {
    console.error("Error processing payout:", e);
    return res.status(500).send({
      message: "An error occurred while processing the request.",
      error: e.message,
    });
  }
}


class Params {
  m_key_id: any;
  m_batch_no: any;
  m_callback_url: any;
  payouts: any;
}
