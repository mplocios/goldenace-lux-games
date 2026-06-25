import { DataTypes, Model } from "sequelize";
import { sequelize } from "../database/Database";

class WalletAccount extends Model {
  public id!: number;
  public user_id!: number | null;
  public account_number!: string | null;
  public account_name!: string | null;
  public account_type!: string | null;
  public account_type_name!: string | null;
}

WalletAccount.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    account_number: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    account_name: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    bank_type: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    bank_name: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "WalletAccount",
    tableName: "wallet_accounts",  
    timestamps: false,
  }
);

export default WalletAccount;
