'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Games', 'rtp', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn('Games', 'volatility', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Games', 'source', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'slotegrator',
    });
    await queryInterface.addColumn('Games', 'thumbnail', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Games', 'rtp');
    await queryInterface.removeColumn('Games', 'volatility');
    await queryInterface.removeColumn('Games', 'source');
    await queryInterface.removeColumn('Games', 'thumbnail');
  }
};
