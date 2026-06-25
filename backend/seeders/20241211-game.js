'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const games = [
      {
        uuid: 'f4e9d2f1a77c4b2a933e9f8fbb0a7c5e',
        name: 'Horse Race',
        image : 'horse',
        description: 'An exciting and fast-paced horse racing game where you can place bets and watch thrilling races.',
        is_active: true,
        url: 'https://example.com/horse-race',
        provider: 'House',
        technology: 'Phaser 3',
        type : 'race',
        has_lobby: 1,
        is_mobile: 1,
        has_freespins: 0,
        has_tables: 0,
        freespin_valid_until_full_day: 0,
        label: 'House',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert('Games', games);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Games', { uuid: 'b7ff23f3d76e4d7b9a6e5f9cde5fa8b9' }, {});
  },
};
