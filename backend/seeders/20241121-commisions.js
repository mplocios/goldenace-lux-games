'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const commissions = [
      {
        TYPE: 'HOUSE',
        PERCENTAGE: 5.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        TYPE: 'SUPER_AGENT',
        PERCENTAGE: 10.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        TYPE: 'MASTER_AGENT',
        PERCENTAGE: 10.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        TYPE: 'SUB_AGENT',
        PERCENTAGE: 10.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert('commission', commissions);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('commission', null, {});
  },
};
