import { FastifyInstance } from 'fastify';
import { kadaCashin } from './cashin';
import { kadaCashout } from './cashout';
import { kadaCallback } from './callback';

export class KadaPay {
  public static async register(app: FastifyInstance) {
    app.post('/cashin', kadaCashin);
    app.post('/cashout', kadaCashout);
    app.route({
      method: ['GET', 'POST'],
      url: '/callback',
      handler: kadaCallback,
    });
  }
}
