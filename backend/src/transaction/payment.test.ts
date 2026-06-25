import { FastifyReply, FastifyRequest } from "fastify";
import Wallet from "../../models/Wallet";
import WebSocketService from "../services/WebSocketService";

export async function PaymentTest(req: FastifyRequest<{ Body: Params }>, res: FastifyReply) {
  try {
    const { 
      m_key_id,
      m_method,
      m_currency,
      m_amount,
      m_order_no,
      m_callback_url, 
      m_success_url 
    } = req.body;
 
    
    const msg = m_amount < 100 ? "Amount of payout is lower than the minimum limit of 100.00" : 
      m_amount > 500000 ? "Amount of payout is above the maximum limit of 500,000.00" : "ok";

    let userId = m_order_no.slice(0, m_order_no.length - 11);  
    
    if (msg === "ok") {
      const wallet = await Wallet.findOne({
        where: { userId: userId }
      });

  

      if (wallet) {
        const credit =  parseFloat(wallet.credits)
        const newBalance = +credit + +m_amount
        wallet.credits = newBalance;  // Add the amount to credits
        await wallet.save();

        // After updating the wallet, send a message to the frontend
        // Here you would use WebSocketService to send the updated credits to the frontend
        WebSocketService.sendToClient(userId, {
          channel:  "/CreditUpdate",
          data: {
            credits: wallet.credits,  // Send the updated credits
            message: "Your credits have been updated successfully.",
          }
        });
      } else {
        console.error(`Wallet not found for user ID ${userId}`);
        return res.status(404).send({
          message: "Wallet not found for the provided user ID.",
          status: "failed",
        });
      }
    }

    // Return the response
    return res.send({
      message: msg,
      status: msg === "ok" ? "success" : "failed",
      response: {
        paymentUrl: m_success_url || ""
      },
    });
  } catch (e) {
    console.error("Error processing payment:", e);  
    return res.status(500).send({
      message: "An error occurred while processing the payment.",
      error: e.message,
    });
  }
}

class Params {
  m_key_id: any;
  m_method: any;
  m_currency: any;
  m_amount: any;
  m_order_no: any;
  m_callback_url: any;
  m_success_url: any;
}
