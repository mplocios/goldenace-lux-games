import { sequelize } from '../database/Database';
import { Model, DataTypes } from 'sequelize';

class HouseCommission extends Model {
  public ID!: number;
  public HOUSE_PERCENTAGE!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

HouseCommission.init(
  {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    HOUSE_PERCENTAGE: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'house_commission',
  }
);

export default HouseCommission;
