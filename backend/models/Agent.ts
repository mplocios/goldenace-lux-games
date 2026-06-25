import { sequelize } from '../database/Database';
import { Model, DataTypes } from 'sequelize';

class Agent extends Model {
  public id!: number;
  public userId!: number | null;
  public recruiterId!: number | null;
  public pitikId!: number | null;
  public type!: 'Super' | 'Master' | 'Agent';
  public code!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Agent.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    recruiterId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Agents",
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    pitikId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Pitiks",
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    type: {
      type: DataTypes.ENUM('Super', 'Master', 'Agent'),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: 'Agents',
  }
);

// Agent.belongsTo(Referral, { foreignKey: 'referralId', targetKey: 'id' });
// Referral.hasMany(Agent, { foreignKey: 'referralId' });

export default Agent;
