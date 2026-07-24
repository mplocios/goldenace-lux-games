import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import axios from 'axios';
import * as crypto from 'crypto';
import generateSignature from '../utils/calculateXSign';
import Game from "../../models/Game";
import { CasinoManager } from "../manager/CasinoManager";
import { Sequelize,Op } from 'sequelize';
import { coreBridgeClient } from '../provider/core/client';
import { COREBRIDGE_CURRENCY, COREBRIDGE_JURISDICTION } from '../provider/core/config';

// Load environment variables from .env file
const merchantKey = process.env.SLOTEGRATOR_MERCHANT_KEY || '';
const merchantId = process.env.SLOTEGRATOR_MERCHANT_ID || '';
const baseUrl = process.env.SLOTEGRATOR_URL || '';
const returnUrl = process.env.SLOTEGRATOR_RETURN_URL ||  "";

export class CasinoController {
  static async init(app: FastifyInstance) {

    const apiController = new ApiController()
    app.get('/games', apiController.Games);

    app.post('/initGames', apiController.initGames);
    app.get('/getGames', apiController.getGames);
    app.get('/saveGames/:page', apiController.saveGames);
    
    app.get('/coutGames', apiController.countGames);
    app.get('/getLimits', apiController.getLimits);
    ////
    app.get('/lobbyGames', apiController.lobbyGames);
    app.get('/games/providers',apiController.getGamesProvider)
    app.get('/games/types',apiController.getGameTypes)

    app.post('/selfValidate',apiController.selfValidate)
    app.post('/test/selfValidate',apiController.selfValidateTest)
    app.post('/play/init', apiController.unifiedGameInit)
    app.get('/games/:uuid', apiController.getGameByUuid)
  }
}

class ApiController {

  casinoManager : CasinoManager
  
  constructor() {
 
  }

  async Games(req: FastifyRequest<{ Querystring: GamesParams }>, res: FastifyReply) {
    try {
      const { provider, type, order_by = 'asc', offset, limit, is_mobile , is_active, q, uuids } = req.query;

      // Construct the query options
      const queryOptions: any = {
        where: {},
        order: [['id', order_by === 'desc' ? 'desc' : 'asc']],
        offset: offset ? Number(offset) : undefined,
        limit: limit ? Number(limit) : undefined,
      };

      // Add filters to the where clause if provided
      if (provider) queryOptions.where.provider = provider;
      if (type) queryOptions.where.type = type;
      if (is_active !== undefined) queryOptions.where.is_active = Boolean(is_active);
      if (is_mobile !== undefined) queryOptions.where.is_mobile = Boolean(is_mobile);

      if (uuids) {
        queryOptions.where.uuid = { [Op.in]: uuids.split(',') };
      }

      if (q) {
        const term = `%${q}%`;
        queryOptions.where[Op.or] = [
          { name: { [Op.like]: term } },
          { provider: { [Op.like]: term } },
          { type: { [Op.like]: term } },
        ];
      }

      return await Game.findAll(queryOptions);

    } catch (e) {
      return e; // Return error if any
    }
  }
  async getGameTypes(req: FastifyRequest, res: FastifyReply) {

  try {
    const types = await Game.findAll({
        attributes: [
            [Sequelize.fn('DISTINCT', Sequelize.col('type')), 'type']
        ]
    });

    const typeList = types.map(g => g.type);  
    res.send(typeList);

  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch game types' });
  }

  }
  async getGamesProvider(req: FastifyRequest, res: FastifyReply) {
    try {
   
        const providers = await Game.findAll({
            attributes: [
                [Sequelize.fn('DISTINCT', Sequelize.col('provider')), 'provider']
            ]
        });
         
        const providerList = providers.map(g => g.provider);

        res.send(providerList);
    } catch (error) {
        // If an error occurs, return a 500 status with an error message
        res.status(500).send({ error: 'Failed to fetch game providers' });
    }
}

  async getGames(req: FastifyRequest<{Querystring : getGamesParams}>, res: FastifyReply) {

    const { expand } = req.query
    const timestamp = Math.floor(Date.now() / 1000);  // Current timestamp
    const nonce = crypto.randomUUID();  // Generate a unique nonce
    let mergeObj = {}
    // Set the request parameters
    const headers = {
      'X-Merchant-Id': merchantId,
      'X-Timestamp': timestamp.toString(),
      'X-Nonce': nonce,
    };
    
    const requestParams = {
      expand
    };
    mergeObj = headers
    if(expand){
      Object.assign(mergeObj,requestParams)
    }
    const signature = generateSignature(mergeObj);
    // // Add the signature to headers
    headers['X-Sign'] = signature;
    const url = `${baseUrl}/games`
    try { 
      const response = await axios.get(url, {
        params : requestParams,
        headers: headers,  // Attach the authorization headers
      });
      //filtering only mobile games
      
        const games = response.data.items.filter((a,b)=>{
          return a.is_mobile == 1
        })
      return games
    } catch (error) {
      console.error('Error fetching games:', error);
      return [];
    }
  } 
  async saveGames(req: FastifyRequest<{ Params: { page: string }; Querystring: getGamesParams }>, res: FastifyReply) {
    const { page } = req.params;
    const timestamp = Math.floor(Date.now() / 1000); // Current timestamp
    const nonce = crypto.randomUUID(); // Generate a unique nonce
    let mergeObj = {};
  
    // Set the request parameters
    const headers = {
      'X-Merchant-Id': merchantId,
      'X-Timestamp': timestamp.toString(),
      'X-Nonce': nonce,
    };
  
    const requestParams = { page };
    mergeObj = headers;
  
    if (page) {
      Object.assign(mergeObj, requestParams);
    }
  
    const signature = generateSignature(mergeObj);
    headers['X-Sign'] = signature;
  
    const url = `${baseUrl}/games/index?page=${page}`;
    try {
      const response = await axios.get(url, {
        params: requestParams,
        headers: headers, // Attach the authorization headers
      });
 
      // Use for...of loop to process each game sequentially and await all async operations
      for (const g of response.data.items) {
        // Wait for the find operation to complete
        let game = await Game.findOne({
          where: { uuid: g.uuid },
        });
  
        // If the game doesn't exist, create it
        if (!game) {
    
          await Game.create(g); // Ensure this operation is awaited
        } else {
          // Optionally log that the game already exists
          console.log(`UUID: ${g.uuid} already exists. Skipping.`);
        }
      }
  
      // Only after all the asynchronous operations are completed, return the response
      return response.data;
    } catch (error) {
      console.error('Error fetching games:', error);
      return [];
    }
  }
  
  async initGames(req: FastifyRequest<{Body : initGamesParams}>, res: FastifyReply) {

    try {



      const requestData = req.body
      const nonce = crypto.randomUUID(); 
      const timestamp = Math.floor(Date.now() / 1000);  // Current timestamp
      // Default device is "desktop"
      const casinoManager = CasinoManager.getInstance()
      const data = {
        ...requestData,
        return_url : returnUrl,
        session_id : nonce,
        device: requestData.device || 'desktop',  // If device is not provided, default to "desktop"
      };

      const url = `${baseUrl}/games/init`
      const headers = {
        'X-Merchant-Id': merchantId,
        'X-Timestamp': timestamp.toString(),
        'X-Nonce': nonce,
      };

      const mergeObj = {
        ...headers,
        ...data
      }
      const signature = generateSignature(mergeObj);
      
      headers['X-Sign'] = signature;
      const head=  { 
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded',
          ...headers 
        }    
      }
      
      await casinoManager.setUserCasinoSession(data)
      
      const response = await axios.post(url, data, head )
  
      return response.data;
    } catch (error) {
      console.error('Error initializing game session:', error);
      throw new Error('Failed to initialize game session');
    }
  } 
  async lobbyGames(req: FastifyRequest<{Querystring : lobbyGamesParams}>, res: FastifyReply) {

    try {
      const requestParams = req.query
      const nonce = crypto.randomUUID(); 
      const timestamp = Math.floor(Date.now() / 1000);  // Current timestamp
      // Default device is "desktop"
      const data = {
        ...requestParams,
      };
      const url = `${baseUrl}/games/lobby`
      const headers = {
        'X-Merchant-Id': merchantId,
        'X-Timestamp': timestamp.toString(),
        'X-Nonce': nonce,
      };

      const mergeObj = {
        ...headers,
        ...data
      }
      const signature = generateSignature(mergeObj);
      
      headers['X-Sign'] = signature;
      const response = await axios.get(url, {
        params : requestParams,
        headers: headers,  // Attach the authorization headers
      });

      return response.data;
    } catch (error) {
      console.error('Error initializing game session:', error);
      throw new Error('Failed to initialize game session');
    }
  } 
  // Example API call: Get balance
  async getLimits(req: FastifyRequest<{Querystring : lobbyGamesParams}>, res: FastifyReply): Promise<any> {
    try {
      const requestParams = req.query
      const nonce = crypto.randomUUID(); 
      const timestamp = Math.floor(Date.now() / 1000);  // Current timestamp
      // Default device is "desktop"
      const data = {
        ...requestParams,
      };

      const url = `${baseUrl}/limits`
      const headers = {
        'X-Merchant-Id': merchantId,
        'X-Timestamp': timestamp.toString(),
        'X-Nonce': nonce,
      };

      const mergeObj = {
        ...headers,
        ...data
      }
      const signature = generateSignature(mergeObj);
      
      headers['X-Sign'] = signature;
      const response = await axios.get(url, {
        params : requestParams,
        headers: headers,  // Attach the authorization headers
      });

      return response.data;
    } catch (error) {
      console.error('Error initializing game session:', error);
      throw new Error('Failed to initialize game session');
    }
   
  }

  // Example API call: Get merchant limits
  async getMerchantLimits(): Promise<any> {
    try {
      const response = await axios.get(`${baseUrl}/limits`);
      return response.data;
    } catch (error) {
      console.error("Error fetching merchant limits:", error);
    }
  }

  // Example API call: Get freespin limits
  async getFreespinLimits(): Promise<any> {
    try {
      const response = await axios.get(`${baseUrl}/limits/freespin`);
      return response.data;
    } catch (error) {
      console.error("Error fetching freespin limits:", error);
    }
  }

  // Example API call: Notify balance update
  async notifyBalanceUpdate(balance: number, sessionId: string): Promise<any> {
    try {
      const response = await axios.post(`${baseUrl}/balance/notify`, `balance=${balance}&session_id=${sessionId}`);
      return response.data;
    } catch (error) {
      console.error("Error notifying balance:", error);
    }
  }

  // Example API call: Get jackpots
  async getJackpots(): Promise<any> {
    try {
      const response = await axios.get(`${baseUrl}/jackpots`);
      return response.data;
    } catch (error) {
      console.error("Error fetching jackpots:", error);
    }
  }

  // Example API call: Set freespin campaign
  async setFreespinCampaign(data: any): Promise<any> {
    try {
      const response = await axios.post(`${baseUrl}/freespins/set`, data);
      return response.data;
    } catch (error) {
      console.error("Error setting freespin campaign:", error);
    }
  }

  async unifiedGameInit(req: FastifyRequest<{Body: initGamesParams}>, res: FastifyReply) {
    try {
      const requestData = req.body;
      const gameUuid = requestData.game_uuid;
      const demo = !!requestData.demo;
      const game = await Game.findOne({ where: { uuid: gameUuid } });
      if (!game) return res.status(404).send({ error: 'Game not found' });

      if (game.source === 'corebridge') {
        if (demo) {
          const data = await coreBridgeClient.post('/games/init-demo', {
            game_uuid: gameUuid,
            currency: requestData.currency || COREBRIDGE_CURRENCY,
            language: requestData.language || 'en',
            ...(requestData.return_url && { return_url: requestData.return_url }),
          });
          return data;
        }

        try {
          await coreBridgeClient.post('/player/create', {
            player_id: requestData.player_id,
            currency: requestData.currency || COREBRIDGE_CURRENCY,
            country: COREBRIDGE_JURISDICTION,
          });
        } catch (e: any) {
          if (e?.response?.data?.error_code !== 'PLAYER_EXISTS') {
            console.warn('CoreBridge player create warning:', e?.response?.data || e.message);
          }
        }

        const data = await coreBridgeClient.post('/games/init', {
          game_uuid: gameUuid,
          player_id: requestData.player_id,
          currency: requestData.currency || COREBRIDGE_CURRENCY,
          language: requestData.language || 'en',
          ...(requestData.return_url && { return_url: requestData.return_url }),
        });
        return data;
      }

      // Slotegrator
      const nonce = crypto.randomUUID();
      const timestamp = Math.floor(Date.now() / 1000);
      const casinoManager = CasinoManager.getInstance();
      const data = {
        ...requestData,
        return_url: returnUrl,
        session_id: nonce,
        device: requestData.device || 'desktop',
      };

      const headers = {
        'X-Merchant-Id': merchantId,
        'X-Timestamp': timestamp.toString(),
        'X-Nonce': nonce,
      };

      const signature = generateSignature({ ...headers, ...data });
      headers['X-Sign'] = signature;

      await casinoManager.setUserCasinoSession(data);
      const response = await axios.post(`${baseUrl}/games/init`, data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...headers },
      });
      return response.data;
    } catch (error) {
      console.error('Unified game init error:', error?.response?.data || error.message);
      return res.status(500).send({ error: 'Failed to initialize game' });
    }
  }

  async getGameByUuid(req: FastifyRequest<{ Params: { uuid: string } }>, res: FastifyReply) {
    const game = await Game.findOne({ where: { uuid: req.params.uuid } });
    if (!game) return res.status(404).send({ error: 'Game not found' });
    return res.send(game);
  }

  async countGames(req: FastifyRequest<{ Querystring: CountGamesParams }>, res: FastifyReply) {
    try {
      const { provider, type, offset, limit, is_mobile } = req.query;
  
      // Construct the query options
      const queryOptions: any = {
        where: {},
        offset: offset ? Number(offset) : undefined,
        limit: limit ? Number(limit) : undefined,
      };
  
      // Add filters to the where clause if provided
      if (provider) queryOptions.where.provider = provider;
      if (type) queryOptions.where.type = type;
      if (is_mobile !== undefined) queryOptions.where.is_mobile = Boolean(is_mobile);

      const totalCount = await Game.count(queryOptions);

      return { totalCount };
 
    } catch (e) {
      return e; // Return error if any
    }
  }
  async selfValidate(req: FastifyRequest<{Body : selfValidateParams}>, res: FastifyReply) {
    const requestData = req.body
    const nonce = crypto.randomUUID(); 
    const timestamp = Math.floor(Date.now() / 1000);  // Current timestamp
    // Default device is "desktop"
    
    const data = {
      ...requestData,
      session_id : nonce,
    };

    const url = `${baseUrl}/self-validate`
    const headers = {
      'X-Merchant-Id': merchantId,
      'X-Timestamp': timestamp.toString(),
      'X-Nonce': nonce,
    };

    const mergeObj = {
      ...headers,
      ...data
    }
    const signature = generateSignature(mergeObj);
    
    headers['X-Sign'] = signature;
    const head=  { 
      headers:{
        'Content-Type': 'application/x-www-form-urlencoded',
        ...headers 
      }    
    }
    const response = await axios.post(url, data, head )

    return response.data;
  }
  async selfValidateTest(req: FastifyRequest<{Body : selfValidateParams}>, res: FastifyReply) {
    const requestData = req.body
    const nonce = crypto.randomUUID(); 
    const timestamp = Math.floor(Date.now() / 1000);  // Current timestamp
    // Default device is "desktop"
    
    const data = {
      ...requestData,
      session_id : nonce,
    };

    const url = `${baseUrl}/self-validate`
    const headers = {
      'X-Merchant-Id': merchantId,
      'X-Timestamp': timestamp.toString(),
      'X-Nonce': nonce,
    };

    const mergeObj = {
      ...headers,
      ...data
    }
    const signature = generateSignature(mergeObj);
    
    headers['X-Sign'] = signature;
    const head=  { 
      headers:{
        'Content-Type': 'application/x-www-form-urlencoded',
        ...headers 
      }    
    }
    const response = await axios.post(url, data, head )
    const logs = response.data.log

    const formatted = await logs.map(a=>{
      return parseIfJson(a)
    })

    return formatted;
  }

}


function parseIfJson(str) {
  try {
    let parsedObj = JSON.parse(str);
    return parsedObj;
  } catch (e) {
    return str;
  }
}


// Example freespin campaign data
const freespinCampaignData = {
  player_id: 'abcd12345',
  player_name: 'PlayerName',
  currency: 'USD',
  quantity: 5,
  valid_from: 1518610000,
  valid_until: 1519610000,
  freespin_id: 'freespin-12345',
  game_uuid: 'game-uuid'
};

// Set freespin campaign
// apiController.setFreespinCampaign(freespinCampaignData).then(response => {
//   console.log('Freespin Campaign:', response);
// });

class GamesParams{
  provider?: string;
  type?: string;
  is_mobile?: boolean;
  order_by?: 'asc' | 'desc';
  offset?: number;
  limit?: number;
  is_active?: boolean;
  q?: string;
  uuids?: string;
}
class CountGamesParams{
  provider?: string;  
  type?: string;
  is_mobile?: boolean;
  offset?: number;
  limit?: number;
}
class getGamesParams {
  expand: string;
};
class lobbyGamesParams {
  game_uuid: string;
  currency: string;
  technology?: string;
};
class initGamesParams {
  game_uuid: string;
  player_id: string;
  player_name: string;
  currency: string;
  session_id?: string;
  device?: 'desktop' | 'mobile';
  return_url?: string;
  language?: string;
  email?: string;
  lobby_data?: string;
  demo?: boolean;
};
class selfValidateParams {
  game_uuid?: string;
  player_id?: string;
  player_name?: string;
  currency?: string;
  session_id?: string;
  device?: 'desktop' | 'mobile'; // Default: "desktop"
  return_url?: string;
  language?: string;
  email?: string;
  lobby_data?: string;
};