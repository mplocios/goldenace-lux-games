import { sequelize } from '../database/Database';
import { Model, DataTypes } from 'sequelize';

class BetTransaction extends Model {
  public ID!: number;
  public userId!: number;
  public GAME_ID!: number;
  public GAMEROUND_ID!: number;
  public STATUS!: 'ONGOING' | 'COMPLETE' | 'CANCELLED' | 'ROLLBACK' | 'VOID';
  public BET_AMOUNT!: number;
  public betPlace!: string;
  public TRANSACTION_ID!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

BetTransaction.init(
  {
    ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    TRANSACTION_ID: {
      type: DataTypes.STRING,
      allowNull: false,
      onDelete: 'CASCADE',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    GAME_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      onDelete: 'CASCADE',
    },
    GAMEROUND_ID: {
      type: DataTypes.STRING,
      allowNull: false,
      onDelete: 'CASCADE',
    },
    STATUS: {
      type: DataTypes.ENUM('ONGOING', 'COMPLETE', 'CANCELLED','ROLLBACK', 'VOID'),
      allowNull: false,
      defaultValue: 'ONGOING',
    },
    BET_AMOUNT: {
      type: DataTypes.DECIMAL(16,4),
      allowNull: false,
    },
    BET_PLACE: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'bet_transactions',
  }
);

export default BetTransaction;
