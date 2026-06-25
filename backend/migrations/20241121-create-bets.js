'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Bets', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      transaction_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('COMPLETE', 'CANCELLED','ROLLBACK'),
        allowNull: true,
        defaultValue: 'COMPLETE',
      },
      gameId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      gameRoundId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      result: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      turnover: {
        type: Sequelize.DECIMAL(16,4),
        allowNull: false,
      },
      payout: {
        type: Sequelize.DECIMAL(16,4),
        allowNull: true,
      },
      returnBet : {
        type: Sequelize.DECIMAL(16,4),
        allowNull: true,
      },
      netWin: {
        type: Sequelize.DECIMAL(16,4),
        allowNull: false,
      },
      event: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      previousBalance: {
        type: Sequelize.DECIMAL(16,4),
        allowNull: true,
      },
      newBalance: {
        type: Sequelize.DECIMAL(16,4),
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
    await queryInterface.dropTable('Bets');
  }
};
