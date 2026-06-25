'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const wallets = [];

  // Create wallets for userId from 1 to 21
  for (let userId = 1; userId <= 11; userId++) {
    wallets.push({
      userId,
      credits: 1000,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Insert data into the Wallet table
  await queryInterface.bulkInsert('wallet', wallets);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('wallet', null, {});
  }
};
