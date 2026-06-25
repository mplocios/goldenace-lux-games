import { DataTypes, Model } from "sequelize";
import { sequelize } from "../database/Database";

class Transaction extends Model {
  public id!: number;
  public userId!: number;
  public amount!: any;
  public paymentType!: string;
  public event!: string;
  public orderNumber!: number;
	public status!: string;  
  public previousBalance!: string;
  public newBalance!: string;
  public meta!: string;
  public remarks!: string;
  public send_to_acc_num!: string;
  public send_to_name!: string;
}

Transaction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(16,4),
      allowNull: false,
    },
    channel: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    event: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    orderNumber: {  
      type: DataTypes.STRING(255),
      allowNull: true,
    },
		status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    previousBalance: {
      type: DataTypes.DECIMAL(16,4),
      allowNull: true,
    },
    newBalance: {
      type: DataTypes.DECIMAL(16,4),
      allowNull: true,
    },
    meta: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    send_to_acc_num: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    send_to_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Transaction",
    tableName: "Transactions",
    timestamps: true,
  }
  
);

export default Transaction;
