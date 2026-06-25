'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Games', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      uuid: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true, // Ensuring that UUID is unique
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      image: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      provider: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      technology: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      has_lobby: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      is_mobile: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      has_freespins: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      has_tables: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      freespin_valid_until_full_day: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      label: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Games');
  }
};
