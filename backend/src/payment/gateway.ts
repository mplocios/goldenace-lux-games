import { FastifyReply, FastifyRequest } from 'fastify';
import { cashin as digiluckCashin } from './CashIn';
import { cashout as digiluckCashout } from './CashOut';
import { kadaCashin } from './kadapay/cashin';
import { kadaCashout } from './kadapay/cashout';

const GATEWAY_CASHIN = (process.env.PAYMENT_GATEWAY_CASHIN || 'digiluck').toLowerCase();
const GATEWAY_CASHOUT = (process.env.PAYMENT_GATEWAY_CASHOUT || 'digiluck').toLowerCase();

const cashinHandlers: Record<string, (req: FastifyRequest<any>, res: FastifyReply) => Promise<any>> = {
  digiluck: digiluckCashin,
  kadapay: kadaCashin,
};

const cashoutHandlers: Record<string, (req: FastifyRequest<any>, res: FastifyReply) => Promise<any>> = {
  digiluck: digiluckCashout,
  kadapay: kadaCashout,
};

export async function gatewayCashin(req: FastifyRequest, res: FastifyReply) {
  const handler = cashinHandlers[GATEWAY_CASHIN];
  if (!handler) {
    console.error(`[GATEWAY] Unknown cashin gateway: ${GATEWAY_CASHIN}`);
    return res.code(500).send({ error: `Payment gateway "${GATEWAY_CASHIN}" not configured` });
  }
  console.log(`[GATEWAY] Routing cashin to: ${GATEWAY_CASHIN}`);
  return handler(req as any, res);
}

export async function gatewayCashout(req: FastifyRequest, res: FastifyReply) {
  const handler = cashoutHandlers[GATEWAY_CASHOUT];
  if (!handler) {
    console.error(`[GATEWAY] Unknown cashout gateway: ${GATEWAY_CASHOUT}`);
    return res.code(500).send({ error: `Payment gateway "${GATEWAY_CASHOUT}" not configured` });
  }
  console.log(`[GATEWAY] Routing cashout to: ${GATEWAY_CASHOUT}`);
  return handler(req as any, res);
}
