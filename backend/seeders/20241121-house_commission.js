'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const houseCommissions = [
      {
        HOUSE_PERCENTAGE: 10.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        HOUSE_PERCENTAGE: 15.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        HOUSE_PERCENTAGE: 20.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert('house_commission', houseCommissions);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('house_commission', null, {});
  },
};
