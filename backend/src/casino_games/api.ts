import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { CasinoController } from "./apiController";
import { CallbackController } from "./apiCallback";
 
export class CasinoApi {
  public static async register(app: FastifyInstance) {
    CasinoController.init(app)
    CallbackController.init(app)
  }
}