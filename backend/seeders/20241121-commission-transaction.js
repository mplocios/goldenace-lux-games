'use strict';
// 20% System
// 10% house
// 5% Agent , 4% MasterAgent , 1% SuperAgent 

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const commissionTransactions = [
      {
        id: 1,
        BET_TRANSACTION_ID: 1,
        COMMISSION_SENDER_USER_ID: 1,
        COMMISSION_RECEIVER_USER_ID: 2,
        COMMISSION_FROM: 'Player1', 
        COMMISSION_TO: 'Agent1',
        BET_AMOUNT: 1000.00,
        VIGORISHED_TRANSACTION_AMOUNT: 800.00,
        SYSTEM_TOTAL_COMMISSION: 200.00,
        COMMISSION_AWARD_AMOUNT: 50.00,
        HOUSE_TOTAL_COMMISSION: 100.00,
        COMMISSION_SYSTEM_PERCENTAGE: 20.00,
        COMMISSION_SENDER_PERCENTAGE: 0.00,
        COMMISSION_RECEIVER_PERCENTAGE: 5.00,
        COMMISSION_HOUSE_PERCENTAGE: 10.00,
        STATE: 'COMPLETE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        BET_TRANSACTION_ID: 1,
        COMMISSION_SENDER_USER_ID: 2,
        COMMISSION_RECEIVER_USER_ID: 3,
        COMMISSION_FROM: 'Agent1',
        COMMISSION_TO: 'MasterAgent1',
        BET_AMOUNT: 1000.00,
        VIGORISHED_TRANSACTION_AMOUNT: 800.00,
        SYSTEM_TOTAL_COMMISSION: 200.00,
        COMMISSION_AWARD_AMOUNT: 50.00,
        HOUSE_TOTAL_COMMISSION: 100.00,
        COMMISSION_SYSTEM_PERCENTAGE: 20.00,
        COMMISSION_SENDER_PERCENTAGE: 5.00,
        COMMISSION_RECEIVER_PERCENTAGE: 5.00,
        COMMISSION_HOUSE_PERCENTAGE: 10.00,
        STATE: 'COMPLETE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        BET_TRANSACTION_ID: 1,
        COMMISSION_SENDER_USER_ID: 3,
        COMMISSION_RECEIVER_USER_ID: 4,
        COMMISSION_FROM: 'MasterAgent1',
        COMMISSION_TO: 'SuperAgent1',
        BET_AMOUNT: 1000.00,
        VIGORISHED_TRANSACTION_AMOUNT: 800.00,
        SYSTEM_TOTAL_COMMISSION: 200.00,
        COMMISSION_AWARD_AMOUNT: 10.00,
        HOUSE_TOTAL_COMMISSION: 100.00,
        COMMISSION_SYSTEM_PERCENTAGE: 20.00,
        COMMISSION_SENDER_PERCENTAGE: 5.00,
        COMMISSION_RECEIVER_PERCENTAGE: 1.00,
        COMMISSION_HOUSE_PERCENTAGE: 10.00,
        STATE: 'COMPLETE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        BET_TRANSACTION_ID: 1,
        COMMISSION_SENDER_USER_ID: 3,
        COMMISSION_RECEIVER_USER_ID: 4,
        COMMISSION_FROM: 'SuperAgent1',
        COMMISSION_TO: 'House',
        BET_AMOUNT: 1000.00,
        VIGORISHED_TRANSACTION_AMOUNT: 800.00,
        SYSTEM_TOTAL_COMMISSION: 200.00,
        COMMISSION_AWARD_AMOUNT: 90.00,
        HOUSE_TOTAL_COMMISSION: 100.00,
        COMMISSION_SYSTEM_PERCENTAGE: 20.00,
        COMMISSION_SENDER_PERCENTAGE: 1.00,
        COMMISSION_RECEIVER_PERCENTAGE: 9.00,
        COMMISSION_HOUSE_PERCENTAGE: 10.00,
        STATE: 'COMPLETE',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    await queryInterface.bulkInsert('commission_transactions', commissionTransactions);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('commission_transactions', null, {});
  },
};
