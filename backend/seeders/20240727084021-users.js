'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    let users = [
      {
        mobile: '09000000000',
        name: "admin",
        type: "admin",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        mobile: '09000000001',
        name: "host",
        type: "host",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    const MOBILE_NUMBER_LENGTH = 11;
    const TOTAL_PLAYERS = 10;

    for (let i = 2; i <= TOTAL_PLAYERS; i++) {
      let mobile = `09000000000`;
      let numCount = `${i}`.length;
      mobile = mobile.slice(0, MOBILE_NUMBER_LENGTH - (numCount)) + `${i}`;
      
      users.push({
        mobile: mobile,
        name: `Name ${i}`,
        type:"player",
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await queryInterface.bulkInsert('users', users , {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
