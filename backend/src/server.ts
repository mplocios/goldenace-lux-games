import Fastify, { FastifyInstance } from 'fastify';
import fjwt, { FastifyJWT } from '@fastify/jwt';
import cors from '@fastify/cors';
import { Users } from './user/Users';
import { AgentSystem } from './agentsystem/AgentSystem';
import { Transactions } from './transaction/Transactions';
import { Sockets } from './game/Sockets';
import { Sequelize } from 'sequelize';
import Wallet from '../models/Wallet';
import { Api } from './agent_api/api';
import { CasinoApi } from './casino_games/api';
import { GameManager } from './game/GameManager';
import { Payments } from './payment/Payment';
import WalletAccount from './wallet_account/wallet_accounts';
import { InhouseApi } from './inhouse_api/api';
import { CoreBridgeApi } from './provider/core/api';
import { AdminApi } from './admin/Admin';
import { KadaPay } from './payment/kadapay';
import Favorite from '../models/Favorite';
import LoginLog from '../models/LoginLog';
import BetTransaction from '../models/BetTransaction';
import GameRound from '../models/GameRound';
import { Op } from 'sequelize';

export class Server {
  fastify: any = undefined
  sequelize: any = undefined
  sockets: Sockets = undefined

  async load(
    port: number, 
    jwtSecret: string,
    sequelize: Sequelize,
    gameManager: GameManager,
  ) {
    const fastify = Fastify({ 
      logger: true,
      trustProxy: true
    });
    this.fastify = fastify
    this.sequelize = sequelize
    this.sockets = new Sockets(gameManager)
    this.sockets.start()
 
    fastify.register(cors, {
      origin: true,
      methods: ['GET', 'POST', 'DELETE'],
      credentials: true,
    });
    
    fastify.register(
      fjwt, { 
        secret: jwtSecret,
        sign: {
          algorithm: 'HS256',
        }, 
      },
    );
    
    fastify.register((app: FastifyInstance) => {
      this.sockets.register(app)
    }, { prefix: 'api/ws' })
    
    const listeners = ['SIGINT', 'SIGTERM'];
    listeners.forEach((signal) => {
      process.on(signal, async () => {
        this.sockets.close()
        await sequelize.close();
        await fastify.close();
        process.exit(0);
      });
    });

    try {

      await fastify.register(require('@fastify/swagger'))
      await fastify.register(require('@fastify/swagger-ui'), {
        routePrefix: '/documentation',
        uiConfig: {
          docExpansion: 'full',
          deepLinking: false
        },
        uiHooks: {
          onRequest: function (request, reply, next) { next() },
          preHandler: function (request, reply, next) { next() }
        },
        staticCSP: true,
        transformStaticCSP: (header) => header,
        transformSpecification: (swaggerObject, request, reply) => { return swaggerObject },
        transformSpecificationClone: true
      })
      
      fastify.register(Users.register, { prefix: 'api/users' })
      // fastify.register(AgentSystem.register, { prefix: 'api/agents' })
      fastify.register(Transactions.register, { prefix: 'api/transactions' })
      fastify.register(Payments.register, { prefix: 'api/payments' })
      fastify.register(KadaPay.register, { prefix: 'api/payments/kadapay' })
      fastify.register(Api.register, { prefix: 'api' })
      fastify.register(WalletAccount.register, { prefix: 'api/user' })
      fastify.register(CasinoApi.register, { prefix: 'api' })

      fastify.register(InhouseApi.register, { prefix: 'api/inhouse' })
      fastify.register(CoreBridgeApi.register, { prefix: 'api/v1/platform' })
      fastify.register(AdminApi.register, { prefix: 'api/admin' })
      // fastify.addHook("onRequest", async (req, reply) => {
      //   console.log(`${req.method} ${req.url}`);
      //   console.log(`${req.body}`)
      // });
      await fastify.ready()
      
      loadAllModels(sequelize)
      Users.loadModels(sequelize)
      await sequelize.authenticate();
      await fastify.listen({
        port: port,
        host: '0.0.0.0',
      });
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  }

  async close() {
    this.sockets.close()
    await this.fastify.close()
    await this.sequelize.close();
  }

}



function loadAllModels(sequelize: Sequelize) {
  Wallet.modelInit(sequelize)
  Favorite.sync();
  LoginLog.sync();
}

async function refundStaleBets() {
  try {
    const cutoff = new Date(Date.now() - 10 * 60 * 1000);
    const staleBets = await BetTransaction.findAll({
      where: { STATUS: 'ONGOING', createdAt: { [Op.lt]: cutoff } },
    });
    if (!staleBets.length) return;

    const byUser: Record<number, number> = {};
    const roundIds = new Set<number>();
    for (const bet of staleBets) {
      byUser[bet.userId] = (byUser[bet.userId] || 0) + parseFloat(String(bet.BET_AMOUNT));
      roundIds.add(bet.GAMEROUND_ID);
    }

    for (const [userId, total] of Object.entries(byUser)) {
      await Wallet.increment('credits', { by: total, where: { userId: +userId } });
    }

    await BetTransaction.update(
      { STATUS: 'CANCELLED' },
      { where: { STATUS: 'ONGOING', createdAt: { [Op.lt]: cutoff } } },
    );

    if (roundIds.size > 0) {
      await GameRound.update(
        { STATUS: 'CANCELLED' },
        { where: { ID: Array.from(roundIds), STATUS: 'ONGOING' } },
      );
    }

    console.log(`[STALE-BET] Refunded ${staleBets.length} stale bets for ${Object.keys(byUser).length} user(s)`);
  } catch (e) {
    console.error('[STALE-BET] Error:', e);
  }
}

setInterval(refundStaleBets, 10 * 60 * 1000);

