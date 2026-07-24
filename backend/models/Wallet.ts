import { DataTypes, Model, Sequelize } from "sequelize";

class Wallet extends Model {
  public id!: number;
  public userId!: number;
  public credits!: any;
  public bonus!: any;
  public withdrawable!: any;
  public agent_db_credits!: any;

  static modelInit(sequelize: Sequelize) {
    Wallet.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          
        },
        credits: {
          type: DataTypes.DECIMAL(16,4),
          allowNull: true,
        },
        bonus: {
          type: DataTypes.DECIMAL(16,4),
          allowNull: true,
          defaultValue: 0,
        },
        withdrawable: {
          type: DataTypes.DECIMAL(16,4),
          allowNull: true,
          defaultValue: 0,
        },
        agent_db_user_id: {
          type: DataTypes.DECIMAL(16,4),
          allowNull: true,
        },
        agent_db_credits: {
          type: DataTypes.DOUBLE,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "Wallet",
        tableName: "wallet",
        timestamps: true,
      }
    );
  }
}


 
export default Wallet;
