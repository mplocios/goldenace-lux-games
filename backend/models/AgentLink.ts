import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../database/Database';
import Agent from './Agent';

class AgentLink extends Model {
  public id!: number;
  public playerId!: number;
  public agentId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AgentLink.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    playerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    agentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Agent,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    tableName: 'AgentLinks',
  }
);

export default AgentLink;
