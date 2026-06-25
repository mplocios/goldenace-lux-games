import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { InHouseController } from "./apiController";
import { CallbackController } from "./apiCallback";
 
export class InhouseApi {
  public static async register(app: FastifyInstance) {
    InHouseController.init(app)
    CallbackController.init(app)
  }
}