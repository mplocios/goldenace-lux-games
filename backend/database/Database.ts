import { Sequelize } from "sequelize";
import dotenv from 'dotenv';
dotenv.config();

const process = require("process");

type ValidDialect = "mysql" | "postgres" | "sqlite" | "mssql";

// Check for test environment
const isTestEnv = process.env.NODE_ENV === "test";

// Base configuration shared across instances
const baseConfig = {
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 3306,
  dialect: `${process.env.DB_DIALECT}` as ValidDialect,
  logging: false,
  timezone: '+08:00',
};
 
// Modify config for the test environment (SQLite in memory)
const testConfig = {
  dialect: "sqlite",
  storage: ":memory:",
};

// Helper function to create a new Sequelize instance
const createSequelizeInstance = (config: object) => new Sequelize(config);

// Main database (db1) configuration
const db1Config = isTestEnv
  ? { ...baseConfig, database: 'db1_test', ...testConfig }
  : { ...baseConfig, database: process.env.DB_NAME };

// Secondary database (db2) configuration
const db2Config = isTestEnv
  ? { ...baseConfig, database: 'db2_test', ...testConfig }
  : { ...baseConfig, database: process.env.DB2_NAME };

// Create the Sequelize instances for both databases
export const sequelize = createSequelizeInstance(db1Config);
export const sequelizeDb2 = createSequelizeInstance(db2Config);

// Create another Sequelize instance without the database connection (for shared connections, e.g., for configuration)
export const NoDbSequelize = createSequelizeInstance({
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  dialect: `${process.env.DB_DIALECT}` as ValidDialect,
  logging: false,
});
