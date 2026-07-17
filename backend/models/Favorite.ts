import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database/Database';

class Favorite extends Model {
  public id!: number;
  public userId!: number;
  public gameUuid!: string;
  public readonly createdAt!: Date;
}

Favorite.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    gameUuid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Favorite',
    tableName: 'Favorites',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { unique: true, fields: ['userId', 'gameUuid'] },
    ],
  }
);

export default Favorite;
