import { FastifyInstance } from "fastify";
import { RegisterController } from "./Register";
import { LoginController } from "./Login";
import { ProfileController } from "./Profile";
import { TransactionController } from "./Transaction";
import { WalletController } from "./Wallet";
import { UserController } from "./User"; 
import { Sequelize } from "sequelize";
import User from "../../models/User";



export class Users {
  public static async register(app: FastifyInstance) {
    RegisterController.init(app)
    LoginController.init(app)
    ProfileController.init(app)
    TransactionController.init(app)
    UserController.init(app)
    WalletController.init(app)
  }

  static loadModels(sequelize: Sequelize) {
    User.modelInit(sequelize)
  }
}

