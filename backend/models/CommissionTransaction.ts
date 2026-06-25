import { sequelize } from '../database/Database';
import { Model, DataTypes } from 'sequelize';

class CommissionTransaction extends Model {
  public id!: number;
  public BET_TRANSACTION_ID!: number;
  public COMMISSION_SENDER_USER_ID!: number;
  public COMMISSION_RECEIVER_USER_ID!: number;
  public COMMISSION_FROM!: string;
  public COMMISSION_TO!: string;
  public BET_AMOUNT!: number;
  public VIGORISHED_TRANSACTION_AMOUNT!: number;
  public SYSTEM_TOTAL_COMMISSION!: number;
  public COMMISSION_AWARD_AMOUNT!: number;
  public HOUSE_TOTAL_COMMISSION!: number;
  public COMMISSION_SYSTEM_PERCENTAGE!: number;
  public COMMISSION_SENDER_PERCENTAGE!: number;
  public COMMISSION_RECEIVER_PERCENTAGE!: number;
  public COMMISSION_HOUSE_PERCENTAGE!: number;
  public STATE!: 'ONGOING' | 'COMPLETE' | 'CANCELLED';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CommissionTransaction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    BET_TRANSACTION_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'bet_transactions',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    COMMISSION_SENDER_USER_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    COMMISSION_RECEIVER_USER_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    COMMISSION_FROM: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    COMMISSION_TO: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    BET_AMOUNT: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    VIGORISHED_TRANSACTION_AMOUNT: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    SYSTEM_TOTAL_COMMISSION: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    COMMISSION_AWARD_AMOUNT: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    HOUSE_TOTAL_COMMISSION: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    COMMISSION_SYSTEM_PERCENTAGE: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    COMMISSION_SENDER_PERCENTAGE: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    COMMISSION_RECEIVER_PERCENTAGE: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    COMMISSION_HOUSE_PERCENTAGE: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    STATE: {
      type: DataTypes.ENUM('ONGOING', 'COMPLETE', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'ONGOING',
    },
  },
  {
    sequelize,
    tableName: 'commission_transactions',
  }
);

export default CommissionTransaction;
