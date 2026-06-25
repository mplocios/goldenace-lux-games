import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { cashin } from "./CashIn";
import { cashout } from "./CashOut";
import { callback } from "./Callback";
import { agentcashout } from "./AgentCashOut";
import { agentcashin } from "./AgentCashIn";
 
export class Payments {
  public static async register(app: FastifyInstance) {
    app.post('/cashin', cashin);
    app.post('/cashout', cashout);
    app.post('/agent/cashout', agentcashout);
    app.post('/agent/cashin', agentcashin);
    app.route({
      method: ['GET', 'POST'],  
      url: '/callback',
      handler: callback,
    });
  }
}
