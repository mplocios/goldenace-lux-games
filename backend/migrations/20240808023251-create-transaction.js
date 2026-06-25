'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Transactions', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
   
      },
      amount: {
        type: Sequelize.DECIMAL(16,4),
        allowNull: false,
      },
      channel: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      event: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      orderNumber: { 
        type: Sequelize.STRING(255),
        allowNull: true,
      },
			status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
       previousBalance: {
        type: Sequelize.DECIMAL(16,4),
        allowNull: true,
      },
      newBalance: {
        type: Sequelize.DECIMAL(16,4),
        allowNull: true,
      },
      meta: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      send_to_acc_num: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      send_to_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Transactions');
  }
};
