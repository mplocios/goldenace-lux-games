import { FastifyReply, FastifyRequest } from "fastify";
import Transaction from "../../models/Transaction";
import Wallet from "../../models/Wallet";
import WebSocketService from "../services/WebSocketService";
import CreditHistory from "../services/CreditHistory"
import getAgentId from "../services/AgenDbId";

export async function callback(req: FastifyRequest<{Body : RequestParams }> , res: FastifyReply) {
  try {
    const body = req.body;
    console.log("[PAYMENT-CB] Received callback:", JSON.stringify(body));
    console.log("[PAYMENT-CB] Headers:", JSON.stringify(req.headers));

    const { status, message, order_id, data } = req.body;

    if (!order_id) {
      console.log("[PAYMENT-CB] No order_id in callback");
      return res.code(400).send({ error_code: 400, message: "Missing order_id" });
    }

    const transaction = await Transaction.findOne({
      where: {
        orderNumber: order_id,
        status: "processing"
      }
    });

    if (!transaction) {
      console.log("[PAYMENT-CB] Transaction not found for order_id:", order_id);
      return res.code(404).send({ error_code: 404, message: "Transaction not found." });
    }

    const isFailed = !status || status === 'failed' || status === 'cancelled' || status === 'expired';
    if (isFailed) {
      console.log("[PAYMENT-CB] Payment failed/cancelled for order:", order_id, "message:", message);
      transaction.status = "failed";
      transaction.remarks = message || "cancelled";
      await transaction.save();

      WebSocketService.sendToClient(`${transaction.userId}`, {
        channel: "/CreditUpdate",
        data: {
          message: message || "Payment was cancelled.",
          status: 'failed'
        }
      });

      return res.code(200).send({ success: true, status: "failed" });
    }

    if (transaction.event === "deposit") {
      await processDeposit(transaction);
      transaction.status = "success";
      await transaction.save();
      console.log("[PAYMENT-CB] Deposit success for order:", order_id);
    }

    if (transaction.event === "withdraw") {
      transaction.status = "success";
      await transaction.save();
      console.log("[PAYMENT-CB] Withdraw success for order:", order_id);
    }

    return res.code(200).send({ success: true, status: "success" });
  } catch (e) {
    console.error("[PAYMENT-CB] Error:", e);
    return res.code(500).send({ error_code: 500, message: e.message || "Internal error" });
  }
}


async function processDeposit(transaction) {
  const wallet = await Wallet.findOne({
    where: { userId: transaction.userId }
  });

  if (!wallet) {
    throw { error_code: 404, message: "Wallet not found." };
  }

  const credit = parseFloat(wallet.credits);
  const newBalance = credit + +transaction.amount;

  wallet.credits = newBalance;
  await wallet.save();

  let agent_id = transaction.userId;

  if (transaction.remarks != "agent") {
    agent_id = await getAgentId(transaction.userId);
  }

  const request = {
    data: {
      user_id: agent_id,
      action: 'INCREASE',
      main_db_transaction_number: transaction.orderNumber,
      value_before: `${credit}`,
      value: `${transaction.amount}`,
      value_after: `${newBalance}`,
      modified_by: +agent_id,
      created_by: +agent_id
    }
  };

  CreditHistory(request);

  WebSocketService.sendToClient(`${wallet.userId}`, {
    channel: "/CreditUpdate",
    data: {
      credits: wallet.credits,
      withdrawable: parseFloat(wallet.withdrawable) || 0,
      message: "Your credits have been updated successfully.",
      status: 'success'
    }
  });
}

interface RequestParams {
  status?: boolean | string;
  message?: string;
  order_id?: string;
  data?: any;
}
