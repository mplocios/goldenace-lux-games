'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('game_rounds', {
      ID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
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
      GAMEROUND: {
        type: Sequelize.STRING,
        allowNull: false,
        onDelete: 'CASCADE',
      },
      STATUS: {
        type: Sequelize.ENUM('ONGOING', 'COMPLETE', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'ONGOING',
      },
      GAME_ROUND_RESULT: {
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
    await queryInterface.dropTable('game_rounds');
  }
};
