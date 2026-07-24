import { FastifyInstance } from "fastify";
import { gatewayCashin, gatewayCashout } from "./gateway";
import { callback } from "./Callback";
import { agentcashout } from "./AgentCashOut";
import { agentcashin } from "./AgentCashIn";

export class Payments {
  public static async register(app: FastifyInstance) {
    app.post('/cashin', gatewayCashin);
    app.post('/cashout', gatewayCashout);
    app.post('/agent/cashout', agentcashout);
    app.post('/agent/cashin', agentcashin);
    app.route({
      method: ['GET', 'POST'],
      url: '/callback',
      handler: callback,
    });
  }
}
