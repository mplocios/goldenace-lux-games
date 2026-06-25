import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { deposit } from "./Deposit";
import { withdraw } from "./Withdraw";
import { agentWithdraw } from "./AgentWithdraw";
import { statusCallback } from "./Status";
import { PaymentTest } from "./payment.test";
import { PayoutTest } from "./payout.test";
import { GetTransaction } from "./GetTransaction";
import { AgentGetTransaction } from "./AgentGetTransaction";
import { UpdateTransaction } from "./UpdateTransaction";

export class Transactions {
  public static async register(app: FastifyInstance) {
    app.post('/deposit', deposit);
    app.post('/withdraw', withdraw);
    // app.post('/agent-withdraw', agentWithdraw);
    app.post('/agent-withdraw', agentWithdraw);
    app.post('/agent-get-transaction', AgentGetTransaction);
    app.route({
      method: ['GET', 'POST'],  
      url: '/status',
      handler: statusCallback,
    });

    //test only
    app.post('/payment/order',PaymentTest)
    app.post('/payout/order',PayoutTest)
    app.post('/get-transaction',GetTransaction)
    app.post('/update-transaction',UpdateTransaction)
  }
}
