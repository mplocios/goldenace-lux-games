import { NoDbSequelize as sequelize } from './Database';

async function setupDatabase() {
  try {
    await sequelize.authenticate();
    await sequelize.query(`DROP DATABASE IF EXISTS ${process.env.DB_NAME};`);
    await sequelize.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME};`);
    await sequelize.close();
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

setupDatabase();
