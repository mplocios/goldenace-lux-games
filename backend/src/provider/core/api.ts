import { FastifyInstance } from 'fastify';
import { CoreBridgeController } from './apiController';
import { CoreBridgeCallbackController } from './apiCallback';

export class CoreBridgeApi {
  public static async register(app: FastifyInstance) {
    CoreBridgeController.init(app);
    CoreBridgeCallbackController.init(app);
  }
}
