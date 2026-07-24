import { DataTypes, Model } from "sequelize";
import { sequelize } from "../database/Database";

class LoginLog extends Model {
  declare id: number;
  declare userId: number;
  declare mobile: string;
  declare nickname: string | null;
  declare userType: string;
  declare ip: string;
  declare userAgent: string | null;
  declare createdAt: Date;
}

LoginLog.init(
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
    mobile: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nickname: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ip: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userAgent: {
      type: DataTypes.STRING(512),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "LoginLog",
    tableName: "login_logs",
    timestamps: true,
    updatedAt: false,
  },
);

export default LoginLog;
