'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('commission_transactions', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      BET_TRANSACTION_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE',
      },
      COMMISSION_SENDER_USER_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE',
      },
      COMMISSION_RECEIVER_USER_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE',
      },
      COMMISSION_FROM: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      COMMISSION_TO: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      BET_AMOUNT: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      VIGORISHED_TRANSACTION_AMOUNT: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      SYSTEM_TOTAL_COMMISSION: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      COMMISSION_AWARD_AMOUNT: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      HOUSE_TOTAL_COMMISSION: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      COMMISSION_SYSTEM_PERCENTAGE: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      COMMISSION_SENDER_PERCENTAGE: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      COMMISSION_RECEIVER_PERCENTAGE: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      COMMISSION_HOUSE_PERCENTAGE: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      STATE: {
        type: Sequelize.ENUM('ONGOING', 'COMPLETE', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'ONGOING',
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
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('commission_transactions');
  },
};
