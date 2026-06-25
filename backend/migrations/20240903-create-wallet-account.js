'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('wallet_accounts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      account_number: {
        type: Sequelize.STRING(250),
        allowNull: false,
      },
      account_name: {
        type: Sequelize.STRING(250),
        allowNull: false,
      },
      account_type: {
        type: Sequelize.STRING(250),
        allowNull: true,
      },
      account_type_name: {
        type: Sequelize.STRING(250),
        allowNull: true,
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
    await queryInterface.dropTable('wallet_accounts');
  }
};
