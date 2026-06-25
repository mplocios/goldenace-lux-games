import { Sequelize } from "sequelize";
import { Server } from "../src/server";
import User from "../models/User";
import WebSocket from 'ws';
import request from 'supertest';
import { CorePlugin } from "../src/game/components/core/CorePlugin";
import { BoatRacePlugin } from "../src/game/components/boatrace/BoatRacePlugin";
import { GameManager } from "../src/game/GameManager";

export class MockSocket {
	recvFn;
	replyFn;

  replies: any[] = []
  closed: boolean = false;

	constructor() {}

	on(event: string, callback: (message: string) => void): void {
		if (event === "message") {
			this.recvFn = callback;
		}
	}

	simulateMessage(message: string): void {
		if (this.recvFn) {
			this.recvFn(message);
		}
	}

	send(message: string): void {
		this.replies.push(message)
	}

  close() {
    this.closed = true
  }

  isClosed() {
    // socket.readyState === WebSocket.CLOSED
    return this.closed
  }
}

export async function pollData(socket, fn) {
  while (true) {
    if (socket.replies.length > 0) {
      fn(socket.replies.shift())
    }

    if (socket.isClosed()) {
      break
    }
    await new Promise(resolve => setTimeout(resolve, 1000 / 60));
  }
}


export function sendMessageMock(socket, channel, data, delay: number) {
  setTimeout(() => { 
    socket.simulateMessage(JSON.stringify({
      channel: channel,
      data: data
    })) 
  }, delay)
}


export async function spawnUsers(total) {
  let users = []
  for (let i = 0; i <= total; i++) {
    let number = "090000" + String(i).padStart(5, '0');
    let user = await User.create({
      mobile: number,
      type: "player",
    })
    users.push(user)
  }
  return users
}


export async function setupSequelize() {
  const jwtSecret = 'secret'
  return new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false
  })
}

export async function setupServer(
  port: number, 
  jwtSecret: string, 
  sequelize: Sequelize
) {
  const server = new Server()

  const gameManager = new GameManager()
  gameManager
    .addPlugin(new CorePlugin)
    .addPlugin(new BoatRacePlugin)

  await server.load(port, jwtSecret, sequelize, gameManager)
  await sequelize.sync()
  return server
}

export async function wsOpen(ws: WebSocket) {
  return new Promise<void>((resolve, rejected) => {
    ws.once("open", () => {
      resolve()
    })
  })
}

export async function wsOnMessage(ws: WebSocket) {
  return new Promise<any>((resolve, rejected) => {
    ws.once("message", (msg) => {
      resolve(JSON.parse(msg))
    })
  })
}

export async function onMessage(
  ws: WebSocket, 
  channel: string, 
  data: any
) {
  return new Promise<any>((resolve) => {
    ws.on("message", onMessage)

    function onMessage(msg) {
      const m1 = JSON.stringify(JSON.parse(msg))
      const m2 = JSON.stringify({channel: channel, data: data})
      
      // console.log(m1)  // Debugger, to see the result
      if (m1 === m2) {
        resolve(JSON.parse(msg))
        ws.removeListener("message", onMessage)
      }
    }
  })
}

export async function createHost(server: Server) {
  await request(server.fastify.server)
    .post('/api/users/register')
    .send({mobile: "09000000001"})

  let host = await User.findOne({where: {mobile: "09000000001"}})
  host.type = "host"
  await host.save()
}

export async function onHostLogin(server: Server) {
  return await request(server.fastify.server)
    .post('/api/users/login')
    .send({mobile: "09000000001"})
}

export function createWs(port: number, token: string): WebSocket {
  const wsHostUrl = `ws://localhost:${port}/ws?token=${token}`
  return new WebSocket(wsHostUrl);
}

export function sendMessage(ws: WebSocket, channel: string, data: any) {
  ws.send(JSON.stringify({
    channel: channel,
    data: data
  }))
}

export async function createPlayer(server: Server, mobile) {
  await request(server.fastify.server)
    .post('/api/users/register')
    .send({mobile: mobile})
}

export async function loginPlayer(server: Server, mobile: string) {
  return await request(server.fastify.server)
    .post('/api/users/login')
    .send({mobile: mobile})
}




// v2
export async function setupServer2(
  port: number, 
  jwtSecret: string, 
  sequelize: Sequelize,
  gameManager: GameManager
) {
  const server = new Server()
  
  await server.load(port, jwtSecret, sequelize, gameManager)
  await sequelize.sync()
  return server
}

export async function setupHostWs(server: Server, port: number) {
  await createHost(server)
  const hostLogin = await onHostLogin(server)

  const ws = createWs(port, hostLogin.body.token)

  return new Promise<WebSocket>((resolve) => {
    ws.once("open", () => {
      resolve(ws)
    })
  })
}

export async function reply(ws: WebSocket) {
  return new Promise<any>((resolve) => {
    ws.once("message", (msg) => {
      resolve(JSON.parse(msg))
    })
  })
}