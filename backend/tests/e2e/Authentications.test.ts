import { Sequelize } from "sequelize";
import { Server } from "../../src/server";
import request from 'supertest';
import { GameManager } from "../../src/game/GameManager";

describe('Authentications', () => {
  
  test('RegisterTest', async () => {
    const port = 6900
    const jwtSecret = 'secret'
    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false
    })


    const server = new Server()
    await server.load(port as number, jwtSecret, sequelize, new GameManager())
    await sequelize.sync()

    const response = await request(server.fastify.server)
      .post('/api/users/register')
      .send({mobile: "09000000000"});

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Registered");

    await server.close()
  });

  test('LoginTest', async () => {
    const port = 6901
    const jwtSecret = 'secret1'
    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false
    })


    const server = new Server()
    await server.load(port as number, jwtSecret, sequelize, new GameManager())
    await sequelize.sync()

    await request(server.fastify.server)
      .post('/api/users/register')
      .send({mobile: "09000000000"});

    const response = await request(server.fastify.server)
      .post('/api/users/login')
      .send({mobile: "09000000000"});

    expect(response.status).toBe(200)
    expect(response.body.token).toBeDefined()
    expect(response.body.user.id).toBe(1)
    expect(response.body.user.mobile).toBe("09000000000")
    expect(response.body.user.name).toBeDefined()
    expect(response.body.user.type).toBe("player")

    await server.close()
  });

  test('LoginCheckTest', async () => {
    const port = 6901
    const jwtSecret = 'secret2'
    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false
    })


    const server = new Server()
    await server.load(port as number, jwtSecret, sequelize, new GameManager())
    await sequelize.sync()

    await request(server.fastify.server)
      .post('/api/users/register')
      .send({mobile: "09000000000"})

    const login = await request(server.fastify.server)
      .post('/api/users/login')
      .send({mobile: "09000000000"})

    const checkLogin = await request(server.fastify.server)
      .post('/api/users/checklogin')
      .set('Authorization', `Bearer ${login.body.token}`)
      .send({mobile: "09000000000"})

    expect(checkLogin.status).toBe(200)
    expect(checkLogin.body.token).toBe(login.body.token)
    expect(checkLogin.body.user).toEqual(login.body.user)
    
    await server.close()
  });
})