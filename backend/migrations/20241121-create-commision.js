'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('commission', {
      ID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      TYPE: {
        type: Sequelize.ENUM('HOUSE', 'SUPER_AGENT', 'MASTER_AGENT', 'SUB_AGENT'),
        allowNull: false,
      },
      PERCENTAGE: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        onUpdate: Sequelize.NOW  
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('commission');
  }
};
