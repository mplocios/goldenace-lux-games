import { sequelize } from '../database/Database';
import { Model, DataTypes } from 'sequelize';

class UserTransaction extends Model {
  public ID!: number;
  public userId!: number;
  public amount!: number;
  public event!: string;
  public previous_balance!: number;
  public new_balance!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserTransaction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(16,4),
      allowNull: false,
    },
    event: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    previous_balance: {
      type: DataTypes.DECIMAL(16,4),
      allowNull: false,
    },
    new_balance: {
      type: DataTypes.DECIMAL(16,4),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'user_transactions',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  }
);

export default UserTransaction;
