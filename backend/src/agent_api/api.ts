import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ApiService } from "./apiservice";
 
export class Api {
  public static async register(app: FastifyInstance) {
    ApiService.init(app)
  }
}