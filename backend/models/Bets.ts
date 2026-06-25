import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database/Database';

class Bets extends Model {
  public id!: number;
  public gameId!: number;
  public userId!: number;
  public gameRoundId!: number;
  public status!: 'COMPLETE' | 'CANCELLED' | 'ROLLBACK' | 'VOID';
  public result!: string;
  public turnover!: number;
  public netWin!: number;
  public payout!: number;
  public returnBet!: number;
  public event!: string;
  public transaction_id!: string;
  public previousBalance!: number;
  public newBalance!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Bets.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    transaction_id: {
      type: DataTypes.STRING,
      allowNull: true,
      onDelete: 'CASCADE',
    },
    status: {
      type: DataTypes.ENUM('COMPLETE', 'CANCELLED','ROLLBACK',"VOID"),
      allowNull: true,
      defaultValue: 'COMPLETE',
    },
    gameId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    gameRoundId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    result: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    turnover: {
      type: DataTypes.DECIMAL(16,4),
      allowNull: false,
    },
    payout: {
      type: DataTypes.DECIMAL(16,4),
      allowNull: true,
    },
    returnBet : {
      type: DataTypes.DECIMAL(16,4),
      allowNull: true,
    },
    netWin: {
      type: DataTypes.DECIMAL(16,4),
      allowNull: false,
    },
    event: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    previousBalance: {
      type: DataTypes.DECIMAL(16,4),
      allowNull: true,
    },
    newBalance: {
      type: DataTypes.DECIMAL(16,4),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Bets',
    tableName: 'Bets',
    timestamps: true,
  }
);

export default Bets;
