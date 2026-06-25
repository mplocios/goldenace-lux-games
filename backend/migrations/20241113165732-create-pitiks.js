'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Pitiks', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      superAgentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      pct1: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      pct2: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      pct3: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Pitiks');
  }
};
