import { FastifyReply, FastifyRequest } from 'fastify';
import Transaction from '../../models/Transaction';
import Wallet from '../../models/Wallet';
import WebSocketService from "../services/WebSocketService";

export async function statusCallback(req: FastifyRequest, res: FastifyReply) {
  try {
    let m_batch_no, w_status, m_message , m_order_no , m_status_code,payouts;
    let orderNumber , status_code, status;
    if (req.body) {
      ({ m_batch_no, m_status: w_status, m_message, m_status_code , payouts} = req.body as any);
      orderNumber = m_batch_no;
      status_code = m_status_code;
      status = payouts[0].status
    } else {
      ({ m_order_no, m_status: w_status, m_message } = req.query as any);
      orderNumber = m_order_no;
      status_code = w_status;
    }

    const transaction = await Transaction.findOne({
      where: { orderNumber }
    });
   
    if (!transaction) {
      return res.code(404).send({ message: 'Transaction not found' });
    }
 
    if (transaction.dataValues.status === 'processing') {

      const wallet = await Wallet.findOne({
        where: { userId: transaction.userId }
      });

      if (!wallet) {
        return res.code(404).send({ message: 'Wallet not found' });
      }

      if (transaction.dataValues.event === 'deposit') {
        const credit =  parseFloat(wallet.credits)
        const newBalance = +credit + +transaction.amount
        wallet.credits = newBalance
        // wallet.credits += +transaction.dataValues.amount;
      } 
      else if (transaction.dataValues.event === 'withdraw') {
 
          // wallet.credits -= +transaction.dataValues.amount;
       
      } 
      else {
        return res.code(400).send({ message: 'Invalid transaction event type' });
      }
      if (w_status === 'success' || status_code == 200 ) {
        if(status) {
          if(status != 'success'){
            await wallet.save();
          }
        }
        else{
          await wallet.save();
        }
       
      }
      const update = {
        status: status_code !== 200 || !status_code ? w_status == 'success' ? w_status: 'failed' : 'success',
        meta: m_batch_no ? JSON.stringify(req.body) : null,
        remarks: m_message || null
      };
      if(update.status == 'success'){
        WebSocketService.sendToClient(`${wallet.userId}`, {
          channel:  "/CreditUpdate",
          data: {
            credits: wallet.credits,  // Send the updated credits
            message: "Your credits have been updated successfully.",
            status: update.status 
          }
        });
        console.log("new wallet credit : ", wallet.credits )
      }
    
    
      if(transaction.status == "processing"){
        if(status == 'failed') {
          update.status = status
          const action = transaction.dataValues.event 
          const credit =  parseFloat(wallet.credits)
          let newBalance = credit
          if(action == 'withdraw'){
            newBalance = +credit + +transaction.amount
            update.status = 'cancelled'
          }
         
          wallet.credits = newBalance

          wallet.save()
          WebSocketService.sendToClient(`${wallet.userId}`, {
            channel:  "/CreditUpdate",
            data: {
              credits: wallet.credits,  // Send the updated credits
              message: "Transaction failed",
              status: update.status 
            }
          });
        }
        await transaction.update(update);
      }
      
    }

    return res.code(200).send({ message: 'Callback received successfully' });

  } catch (error) {
    console.error('Error processing callback:', error);
    return res.code(500).send({ message: 'Internal server error', error: error.message });
  }
}
