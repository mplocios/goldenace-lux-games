import { sequelize } from "../../database/Database";

module.exports = async () => {
  await sequelize.close() // Not working
  console.log("DefaultSequelize.close()")
};