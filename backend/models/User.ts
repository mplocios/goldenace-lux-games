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
  password: string;
  name: string;
  nickname: string;
  type: string;
  playerId: string;
  public status!: string;
  public bannedUntil!: Date | null;

  static modelInit(sequelize: Sequelize) {
    User.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        playerId: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        mobile: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        type: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        nickname: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        status: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: 'active',
        },
        bannedUntil: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: null,
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

    User.hasMany(Transaction, {
      foreignKey: 'userId',
      as: 'transactions',
    });

    Transaction.belongsTo(User, {
      foreignKey: 'userId',
      as: 'user',
    });
   
  }
}

export default User;
