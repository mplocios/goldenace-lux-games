'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Bets', [
      {
        gameId: 1,
        userId: 2,
        gameRoundId:1,
        result : '{"gameResult":[1,2],"playerBets":{"1":20,"2":50},"colorMultiplier":{"2":2},"event":"Win","turnover":70,"returnBet":50,"payout":100,"netwin":80}',
        turnover : 70,
        payout : 100,
        returnBet : 50,
        netWin : 80,
        event : "Win",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        gameId: 1,
        userId: 2,
        gameRoundId:2,
        result : "",
        turnover : 50,
        payout : 50,
        returnBet : 50,
        netWin : 100,
        event : "Win",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        gameId: 1,
        userId: 2,
        gameRoundId:3,
        result : `{"gameResult":[1,3],"playerBets":{"1":50,"3":50},"colorMultiplier":{"1":2,"3":1},"event":"Win","turnover":100,"returnBet":100,"payout":150,"netwin":150}`,
        turnover : 100,
        payout : 150,
        returnBet : 100,
        netWin : 150,
        event : "Win",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        gameId: 1,
        userId: 2,
        gameRoundId:4,
        result : '{"gameResult":[1],"playerBets":{"1":50,"3":50},"colorMultiplier":{"1":3},"event":"Draw","turnover":100,"returnBet":50,"payout":50,"netwin":0}',
        turnover : 100,
        payout : 50,
        returnBet : 50,
        netWin : 0,
        event : "Draw",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        gameId: 1,
        userId: 2,
        gameRoundId:5,
        result : "",
        turnover : 70,
        payout : 100,
        returnBet : 50,
        netWin : 80,
        event : "Win",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        gameId: 1,
        userId: 2,
        gameRoundId:6,
        result : "",
        turnover : 70,
        payout : 100,
        returnBet : 50,
        netWin : 80,
        event : "Win",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        gameId: 1,
        userId: 2,
        gameRoundId:7,
        result : "",
        turnover : 70,
        payout : 100,
        returnBet : 50,
        netWin : 80,
        event : "Win",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        gameId: 1,
        userId: 2,
        gameRoundId:8,
        result : "",
        turnover : 70,
        payout : 100,
        returnBet : 50,
        netWin : 80,
        event : "Win",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        gameId: 1,
        userId: 2,
        gameRoundId:9,
        result : "",
        turnover : 70,
        payout : 100,
        returnBet : 50,
        netWin : 80,
        event : "Win",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        gameId: 1,
        userId: 2,
        gameRoundId:10,
        result : "",
        turnover : 70,
        payout : 100,
        returnBet : 50,
        netWin : 80,
        event : "Win",
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Bets', {
      id: 1
    }, {});
  }
};
