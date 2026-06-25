import { Options, Sequelize } from "sequelize";
import { Server } from "./src/server";
import { GameManager } from "./src/game/GameManager";
import { BoatRacePlugin } from "./src/game/components/boatrace/BoatRacePlugin";
import { AutomationPlugin } from "./src/game/components/automation/Automation";
import { CorePlugin } from "./src/game/components/core/CorePlugin";

require('dotenv').config();
const port = process.env.PORT || 4000;
const jwtSecret = process.env.JWT_SECRET_KEY || 'ToTheMoon__69420';

const isTestEnv = process.env.NODE_ENV === "test";

interface SequelizeTestConfig extends Options {
  dialect: 'sqlite';
  storage: string;
}

interface SequelizeDatabaseConfig extends Options {
  dialect: 'mysql' | 'postgres';
  host: string;
  username: string;
  password: string;
  port: number;
}

let config: SequelizeTestConfig | SequelizeDatabaseConfig;

if (isTestEnv) {
  config = {
    dialect: 'sqlite',
    storage: ':memory:'
  };
} else {
  config = {
    host: process.env.DB_HOST!,
    username: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    port: parseInt(process.env.DB_PORT!),
    dialect: process.env.DB_DIALECT as 'mysql' | 'postgres',
    logging: false
  };
}

let sequelize = new Sequelize(config);

const server = new Server()
const gameManager = new GameManager()
gameManager.addPlugin(new AutomationPlugin)

server.load(port as number, jwtSecret, sequelize, gameManager)


