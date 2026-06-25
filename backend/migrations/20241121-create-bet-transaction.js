'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bet_transactions', {
      ID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      TRANSACTION_ID: {
        type: Sequelize.STRING,
        allowNull: false,
        onDelete: 'CASCADE',
      },
      GAME_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE',
      },
      GAMEROUND_ID: {
        type: Sequelize.STRING,
        allowNull: false,
        onDelete: 'CASCADE',
      },
      STATUS: {
        type: Sequelize.ENUM('ONGOING', 'COMPLETE', 'CANCELLED','ROLLBACK'),
        allowNull: false,
        defaultValue: 'ONGOING',
      },
      BET_AMOUNT: {
        type: Sequelize.DECIMAL(16,8),
        allowNull: false,
      },
      BET_PLACE: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('bet_transactions');
  }
};
