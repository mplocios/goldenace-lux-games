import { sequelize } from '../database/Database';
import { Model, DataTypes } from 'sequelize';

class GameRound extends Model {
  public ID!: number;
  public GAME_ID!: number;
  public GAMEROUND!: number;
  public STATUS!: 'ONGOING' | 'COMPLETE' | 'CANCELLED';
  public GAME_ROUND_RESULT!: string | null;
  public TRANSACTION_ID!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

GameRound.init(
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
    GAME_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      onDelete: 'CASCADE',
    },
    GAMEROUND: {
      type: DataTypes.STRING,
      allowNull: false,
      onDelete: 'CASCADE',
    },
    STATUS: {
      type: DataTypes.ENUM('ONGOING', 'COMPLETE', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'ONGOING',
    },
    GAME_ROUND_RESULT: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'game_rounds',
  }
);

export default GameRound;
