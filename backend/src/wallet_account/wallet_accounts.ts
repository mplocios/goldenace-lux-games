import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import GetWalletAccount from "./getAccount";
import SaveWalletAccount from "./saveAccount";
 

export default class WalletAccount {
  public static async register(app: FastifyInstance) {
    GetWalletAccount.init(app)
    SaveWalletAccount.init(app)

  }
}

