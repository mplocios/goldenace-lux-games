import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../database/Database';
import Agent from './Agent';

export class Pitik extends Model {
  public id!: number;
  public superAgentId!: number;
  public pct1!: number;
  public pct2!: number;
  public pct3!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initAssociation() {
    Pitik.belongsTo(Agent, { foreignKey: 'superAgentId', targetKey: 'id' });
  }
}

Pitik.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    superAgentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Agents",
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    pct1: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    pct2: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    pct3: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'Pitiks',
  }
);

