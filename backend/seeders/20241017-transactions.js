'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Transactions', [
      {
        id: 1,
        userId: 3,
        amount: 500,
        channel:"GCASH",
        event:"deposit",
        orderNumber :"123456",
        status : "processing",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        userId: 3,
        amount: 1000,
        channel:"GCASH",
        event:"withdraw",
        orderNumber :"123456",
        status : "processing",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Transactions', {
      id: 1
    }, {});
  }
};
