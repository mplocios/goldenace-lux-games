import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database/Database';

class Game extends Model {
  public id!: number;
  public uuid!: string; // New UUID field
  public gameName!: string;
  public image!: string;
  public type!: string;
  public provider!: string;
  public technology!: string;
  public hasLobby!: boolean;
  public isMobile!: boolean;
  public hasFreeSpins!: boolean;
  public hasTables!: boolean;
  public freespinValidUntilFullDay!: boolean;
  public label!: string;
  public description?: string;
  public isActivate?: boolean;
  public url?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize the Game model with the correct table name and attributes
Game.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    uuid: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Ensuring that UUID is unique
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    technology: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    has_lobby: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    is_mobile: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    has_freespins: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    has_tables: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    freespin_valid_until_full_day: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    label: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Game',
    tableName: 'Games',  
    timestamps: true,
  }
);

export default Game;
