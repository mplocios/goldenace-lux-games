import { DataTypes, Model, Sequelize } from "sequelize";
import { sequelize } from "../database/Database";
import Wallet from "./Wallet";
import Transaction from "./Transaction";
/** Making it easier to spawn User and not pepper the main code with try and catch */
// export class UserModel {
//   static async create(values: any) {
//     try {
//       return await User.create(values)
//     } catch (e) {
//       console.error(e)
//       return undefined
//     }
//   }
// }

class User extends Model {
  id: any;
  mobile: string;
  name: string;
  type: string;
  
  static modelInit(sequelize: Sequelize) {
    User.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        mobile: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true
        },
        type: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "user",
        tableName: "users",
        timestamps: true,
      }
    );
    
    User.hasOne(Wallet, {
      foreignKey: 'userId',
      as: 'wallet',
    });
   
  }
}

export default User;
