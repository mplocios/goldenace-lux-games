import { sequelize } from '../database/Database';
import { Model, DataTypes } from 'sequelize';

class Commission extends Model {
  public ID!: number;
  public PERCENTAGE!: number;
  public TYPE!: 'HOUSE' | 'SUPER_AGENT' | 'MASTER_AGENT | SUB_AGENT';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Commission.init(
  {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    TYPE: {
      type: DataTypes.ENUM('HOUSE', 'SUPER_AGENT', 'MASTER_AGENT', 'SUB_AGENT'),
      allowNull: false,
    },
    PERCENTAGE: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'commission',
  }
);

export default Commission;
