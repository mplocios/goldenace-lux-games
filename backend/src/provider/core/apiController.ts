import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { coreBridgeClient } from './client';
import { COREBRIDGE_CURRENCY, COREBRIDGE_JURISDICTION } from './config';
import Game from '../../../models/Game';
import User from '../../../models/User';

export class CoreBridgeController {
  static async init(app: FastifyInstance) {
    const controller = new Controller();

    app.post('/games', controller.getGames);
    app.post('/games/tags', controller.getGameTags);
    app.post('/games/lobby', controller.getGamesLobby);
    app.post('/games/init', controller.initGame);
    app.post('/games/init-demo', controller.initGameDemo);
    app.post('/game/launch', controller.launchGame);

    app.post('/player/create', controller.createPlayer);
    app.post('/player/update', controller.updatePlayer);
    app.get('/player/balance', controller.getPlayerBalance);
    app.post('/player/session', controller.getPlayerSession);

    app.get('/reports', controller.getReports);
    app.get('/limits', controller.getLimits);
    app.get('/limits/freespin', controller.getFreespinLimits);
    app.get('/jackpots', controller.getJackpots);

    app.post('/self-validate', controller.selfValidate);
    app.post('/sync-games', controller.syncGames);
  }
}

class Controller {
  async getGames(req: FastifyRequest<{ Body: GetGamesBody }>, res: FastifyReply) {
    try {
      const body = req.body || {};
      const data = await coreBridgeClient.post('/games', {
        page: body.page || 1,
        per_page: body.per_page || 50,
        ...(body.provider && { provider: body.provider }),
        ...(body.type && { type: body.type }),
        ...(body.expand && { expand: body.expand }),
      });
      return data;
    } catch (error) {
      console.error('CoreBridge getGames error:', error?.response?.data || error.message);
      return res.status(500).send({ error: 'Failed to fetch games from CoreBridge' });
    }
  }

  async getGameTags(req: FastifyRequest<{ Body: { expand?: string } }>, res: FastifyReply) {
    try {
      const body = req.body || {};
      const data = await coreBridgeClient.post('/game-tags', body);
      return data;
    } catch (error) {
      console.error('CoreBridge getGameTags error:', error?.response?.data || error.message);
      return res.status(500).send({ error: 'Failed to fetch game tags from CoreBridge' });
    }
  }

  async getGamesLobby(req: FastifyRequest<{ Body: { game_uuid: string; currency?: string } }>, res: FastifyReply) {
    try {
      const body = req.body;
      const data = await coreBridgeClient.post('/games/lobby', {
        game_uuid: body.game_uuid,
        currency: body.currency || COREBRIDGE_CURRENCY,
      });
      return data;
    } catch (error) {
      console.error('CoreBridge getGamesLobby error:', error?.response?.data || error.message);
      return res.status(500).send({ error: 'Failed to fetch game lobby from CoreBridge' });
    }
  }

  async initGame(req: FastifyRequest<{ Body: InitGameBody }>, res: FastifyReply) {
    try {
      const body = req.body;

      // Auto-register player with CoreBridge if not already registered
      try {
        await coreBridgeClient.post('/player/create', {
          player_id: body.player_id,
          currency: body.currency || COREBRIDGE_CURRENCY,
          country: COREBRIDGE_JURISDICTION,
        });
        console.log(`CoreBridge: registered player ${body.player_id}`);
      } catch (regErr: any) {
        // Player may already exist — that's fine
        const errData = regErr?.response?.data;
        if (errData?.error_code !== 'PLAYER_EXISTS') {
          console.warn('CoreBridge player create warning:', errData || regErr.message);
        }
      }

      const data = await coreBridgeClient.post('/games/init', {
        game_uuid: body.game_uuid,
        player_id: body.player_id,
        currency: body.currency || COREBRIDGE_CURRENCY,
        language: body.language || 'en',
        ...(body.return_url && { return_url: body.return_url }),
        ...(body.session_id && { session_id: body.session_id }),
      });
      return data;
    } catch (error) {
      console.error('CoreBridge initGame error:', error?.response?.data || error.message);
      return res.status(500).send({ error: 'Failed to init game on CoreBridge' });
    }
  }

  async initGameDemo(req: FastifyRequest<{ Body: InitGameBody }>, res: FastifyReply) {
    try {
      const body = req.body;
      const data = await coreBridgeClient.post('/games/init-demo', {
        game_uuid: body.game_uuid,
        currency: body.currency || COREBRIDGE_CURRENCY,
        ...(body.player_id && { player_id: body.player_id }),
      });
      return data;
    } catch (error) {
      console.error('CoreBridge initGameDemo error:', error?.response?.data || error.message);
      return res.status(500).send({ error: 'Failed to init demo game on CoreBridge' });
    }
  }

  async launchGame(req: FastifyRequest<{ Body: LaunchGameBody }>, res: FastifyReply) {
    try {
      const body = req.body;
      const data = await coreBridgeClient.post('/game/launch', {
        game_uuid: body.game_uuid,
        player_id: body.player_id,
        currency: body.currency || COREBRIDGE_CURRENCY,
        demo: body.demo || false,
      });
      return data;
    } catch (error) {
      console.error('CoreBridge launchGame error:', error?.response?.data || error.message);
      return res.status(500).send({ error: 'Failed to launch game on CoreBridge' });
    }
  }

  async createPlayer(req: FastifyRequest<{ Body: CreatePlayerBody }>, res: FastifyReply) {
    try {
      const body = req.body;
      const data = await coreBridgeClient.post('/player/create', {
        player_id: body.player_id,
        currency: body.currency || COREBRIDGE_CURRENCY,
        country: body.country || COREBRIDGE_JURISDICTION,
        ...(body.external_id && { external_id: body.external_id }),
      });
      return data;
    } catch (error) {
      console.error('CoreBridge createPlayer error:', error?.response?.data || error.message);
      return res.status(500).send({ error: 'Failed to create player on CoreBridge' });
    }
  }

  async updatePlayer(req: FastifyRequest<{ Body: any }>, res: FastifyReply) {
    try {
      const data = await coreBridgeClient.post('/player/update', req.body);
      return data;
    } catch (error) {
      console.error('CoreBridge updatePlayer error:', error?.response?.data || error.message);
      return res.status(500).send({ error: 'Failed to update player on CoreBridge' });
    }
  }

  async getPlayerBalance(req: FastifyRequest<{ Querystring: { player_id: string; currency?: string } }>, res: FastifyReply) {
    try {
      const { player_id, currency } = req.query;
      const data = await coreBridgeClient.get('/player/balance', {
        player_id,
        currency: currency || COREBRIDGE_CURRENCY,
      });
      return data;
    } catch (error) {
      console.error('CoreBridge getPlayerBalance error:', error?.response?.data || error.message);
      return res.status(500).send({ error: 'Failed to get player balance from CoreBridge' });
    }
  }

  async getPlayerSession(req: FastifyRequest<{ Body: { launch_token: string } }>, res: FastifyReply) {
    try {
      const data = await coreBridgeClient.post('/player/session', req.body);
      return data;
    } catch (error) {
      console.error('CoreBridge getPlayerSession error:', error?.response?.data || error.message);
      return res.status(500).send({ error: 'Failed to get player session from CoreBridge' });
    }
  }

  async getReports(req: FastifyRequest<{ Querystring: { start?: string; end?: string } }>, res: FastifyReply) {
    try {
      const data = await coreBridgeClient.get('/reports', req.query);
      return data;
    } catch (error) {
      console.error('CoreBridge getReports error:', error?.response?.data || error.message);
      return res.status(500).send({ error: 'Failed to get reports from CoreBridge' });
    }
  }

  async getLimits(req: FastifyRequest, res: FastifyReply) {
    try {
      const data = await coreBridgeClient.get('/limits');
      return data;
    } catch (error) {
      console.error('CoreBridge getLimits error:', error?.response?.data || error.message);
      return res.status(500).send({ error: 'Failed to get limits from CoreBridge' });
    }
  }

  async getFreespinLimits(req: FastifyRequest, res: FastifyReply) {
    try {
      const data = await coreBridgeClient.get('/limits/freespin');
      return data;
    } catch (error) {
      console.error('CoreBridge getFreespinLimits error:', error?.response?.data || error.message);
      return res.status(500).send({ error: 'Failed to get freespin limits from CoreBridge' });
    }
  }

  async getJackpots(req: FastifyRequest, res: FastifyReply) {
    try {
      const data = await coreBridgeClient.get('/jackpots');
      return data;
    } catch (error) {
      console.error('CoreBridge getJackpots error:', error?.response?.data || error.message);
      return res.status(500).send({ error: 'Failed to get jackpots from CoreBridge' });
    }
  }

  async selfValidate(req: FastifyRequest<{ Body: { player_id?: string } }>, res: FastifyReply) {
    try {
      const data = await coreBridgeClient.post('/self-validate', req.body || {});
      return data;
    } catch (error) {
      console.error('CoreBridge selfValidate error:', error?.response?.data || error.message);
      return res.status(500).send({ error: 'Failed to run self-validate on CoreBridge' });
    }
  }

  async syncGames(req: FastifyRequest<{ Body: { provider?: string; per_page?: number } }>, res: FastifyReply) {
    try {
      const body = req.body || {};
      const perPage = body.per_page || 100;
      let page = 1;
      let totalSynced = 0;
      let totalSkipped = 0;
      let totalUpdated = 0;

      while (true) {
        const result = await coreBridgeClient.post('/games', {
          page,
          per_page: perPage,
          ...(body.provider && { provider: body.provider }),
          expand: 'tags,parameters,images',
        });

        if (!result.items || result.items.length === 0) break;

        for (const g of result.items) {
          const thumbnail = g.images?.find((img: any) => img.name === 'thumbnail')?.url || g.image || null;
          const rtp = g.parameters?.rtp || null;
          const volatility = g.parameters?.volatility || null;

          const existing = await Game.findOne({ where: { uuid: g.uuid } });
          if (!existing) {
            await Game.create({
              uuid: g.uuid,
              name: g.name,
              image: g.image || null,
              type: g.type || 'slots',
              provider: g.provider || 'unknown',
              technology: g.technology || 'HTML5',
              has_lobby: g.has_lobby || 0,
              is_mobile: g.is_mobile || 0,
              has_freespins: g.has_freespins || 0,
              has_tables: g.has_tables || 0,
              freespin_valid_until_full_day: 0,
              label: g.tags?.length ? g.tags.join(',') : null,
              rtp,
              volatility,
              source: 'corebridge',
              thumbnail,
              is_active: true,
            });
            totalSynced++;
          } else {
            await existing.update({
              image: g.image || existing.image,
              rtp: rtp || existing.rtp,
              volatility: volatility || existing.volatility,
              thumbnail: thumbnail || existing.thumbnail,
              source: existing.source || 'corebridge',
              is_active: true,
            });
            totalUpdated++;
          }
        }

        const meta = result._meta;
        if (!meta || page >= meta.pageCount) break;
        page++;
      }

      return { synced: totalSynced, updated: totalUpdated, skipped: totalSkipped, pages: page };
    } catch (error) {
      console.error('CoreBridge syncGames error:', error?.response?.data || error.message);
      return res.status(500).send({ error: 'Failed to sync games from CoreBridge' });
    }
  }
}

interface GetGamesBody {
  page?: number;
  per_page?: number;
  provider?: string;
  type?: string;
  expand?: string;
}

interface InitGameBody {
  game_uuid: string;
  player_id?: string;
  currency?: string;
  language?: string;
  return_url?: string;
  session_id?: string;
}

interface LaunchGameBody {
  game_uuid: string;
  player_id: string;
  currency?: string;
  demo?: boolean;
}

interface CreatePlayerBody {
  player_id: string;
  currency?: string;
  country?: string;
  external_id?: string;
}
