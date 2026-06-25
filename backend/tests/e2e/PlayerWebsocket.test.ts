import User from "../../models/User";
import Wallet from "../../models/Wallet";
import { Server } from "../../src/server";
import { Channels, delay, GameState } from "../../src/utils/common";
import { createHost, createPlayer, createWs, loginPlayer, onHostLogin, onMessage, sendMessage, setupSequelize, setupServer, wsOnMessage, wsOpen } from "../Common";

const jwtSecret = "secret"

describe('PlayerWebsocket.test', () => {

  test('PlayerReceivingGameStateCycleTest', async () => {
    const port = 6910
    const sequelize = await setupSequelize()
    const server = await setupServer(port, jwtSecret, sequelize)
    server.sockets.gameManager.game.step = 10.0

    await createHost(server)
    const hostLogin = await onHostLogin(server)

    const wsHost = createWs(port, hostLogin.body.token)
    await wsOpen(wsHost)

    const playerMobile = "09000000002"
    await createPlayer(server, playerMobile)
    const logPlayer = await loginPlayer(server, playerMobile)
    const playerWs = createWs(port, logPlayer.body.token)

    await wsOpen(playerWs)

    sendMessage(wsHost, Channels.ChangeState, {state: GameState.NewGame})
    let msg = await onMessage(playerWs, Channels.ChangeState, {state: GameState.NewGame})

    sendMessage(wsHost, Channels.ChangeState, {state: GameState.Open})
    msg = await onMessage(playerWs, Channels.ChangeState, {state: GameState.Open})
    expect(msg.channel).toEqual(Channels.ChangeState)
    expect(msg.data).toEqual({state: GameState.Open})

    msg = await wsOnMessage(playerWs)
    expect(msg.channel).toEqual(Channels.Game)
    expect(msg.data).toEqual({countDown: 4})

    msg = await wsOnMessage(playerWs)
    expect(msg.data).toEqual({countDown: 3})

    msg = await wsOnMessage(playerWs)
    expect(msg.data).toEqual({countDown: 2})

    msg = await wsOnMessage(playerWs)
    expect(msg.data).toEqual({countDown: 1})

    msg = await wsOnMessage(playerWs)
    expect(msg.data).toEqual({countDown: 0})

    msg = await wsOnMessage(playerWs)
    expect(msg.data).toEqual({state: GameState.Closed})

    sendMessage(
      wsHost, Channels.ChangeState, 
      {winners: ['0'], state: GameState.SelectedWinners}
    )

    msg = await wsOnMessage(playerWs)
    expect(msg.data).toEqual({credits: 0, prize: 0})

    msg = await wsOnMessage(playerWs)
    expect(msg.data).toEqual({state: GameState.SelectedWinners})

    sendMessage(wsHost, Channels.ChangeState, {state: GameState.NewGame})
    msg = await wsOnMessage(playerWs)
    expect(msg.channel).toEqual(Channels.ChangeState)
    expect(msg.data).toEqual({state: GameState.NewGame})

    await server.close()
  })

  test('BettingSingleWithCreditsAndOdds', async () => {
    const port = 6911
    const server = await setupServer2(port, jwtSecret, 10.0)
    const hostWs = await setupHostWs(server, port)

    const playerMobile = "09000000002"
    const playerWs = await setupPlayerWs(server, port, playerMobile, 1000)
    
    server.sockets.setStep(1.0)
    await setGameToOpen(hostWs)

    sendMessage(playerWs, Channels.Bet, {bets: {"0": 10}})
    await onMessage(playerWs, Channels.Game, {credits: 990, odds: {'0': 0.9 }})

    sendMessage(playerWs, Channels.Bet, {bets: {"0": 10, "1": 10}})
    await onMessage(playerWs, Channels.Game, {credits: 980, odds: {'0': 1.8, '1': 1.8 }})
    server.sockets.setStep(10.0)

    await onMessage(playerWs, Channels.ChangeState, {state: 'Closed'})

    sendMessage(
      hostWs, Channels.ChangeState, {winners: ['0'], state: GameState.SelectedWinners}
    )
    await onMessage(
      playerWs, Channels.Game, { credits: 998, prize: 18 }
    )

    server.sockets.setStep(1.0)
    await setGameToOpen(hostWs)

    sendMessage(playerWs, Channels.Bet, {bets: {"0": 20}})
    await onMessage(playerWs, Channels.Game, {credits: 978, odds: {'0': 0.9 }})

    sendMessage(playerWs, Channels.Bet, {bets: {"0": 20, "1": 10}})
    await onMessage(playerWs, Channels.Game, {credits: 968, odds: {'0': 1.35, '1': 2.7 }})
    server.sockets.setStep(10.0)

    await onMessage(playerWs, Channels.ChangeState, {state: 'Closed'})

    sendMessage(
      hostWs, Channels.ChangeState, {winners: ['1'], state: GameState.SelectedWinners}
    )
    await onMessage(
      playerWs, Channels.Game, { credits: 995, prize: 27 }
    )

    await server.close()
  })

  test('BettingMultiplayerWithCreditsAndOdds', async () => {
    const port = 6912
    const server = await setupServer2(port, jwtSecret, 10.0)
    const hostWs = await setupHostWs(server, port)

    const p0 = await setupPlayerWs(server, port, "09000000002", 1000)
    const p1 = await setupPlayerWs(server, port, "09000000003", 1000)
    const p2 = await setupPlayerWs(server, port, "09000000004", 1000)

    server.sockets.setStep(1.0)
    await setGameToOpen(hostWs)

    sendMessage(p0, Channels.Bet, {bets: {"0": 10}})
    await onMessage(p0, Channels.Game, {credits: 990, odds: {'0': 0.9 }})

    sendMessage(p1, Channels.Bet, {bets: {"1": 10}})
    await onMessage(p1, Channels.Game, {credits: 990, odds: {'0': 1.8, '1': 1.8 }})

    sendMessage(p2, Channels.Bet, {bets: {"2": 10}})
    await onMessage(p2, Channels.Game, {credits: 990, odds: {'0': 2.7, '1': 2.7, '2': 2.7 }})

    server.sockets.setStep(10.0)
    await onMessage(hostWs, Channels.ChangeState, {state: 'Closed'})
    sendMessage(
      hostWs, Channels.ChangeState, {winners: ['0'], state: GameState.SelectedWinners}
    )

    await onMessage(
      p0, Channels.Game, { credits: 1017, prize: 27 }
    )

    server.sockets.setStep(1.0)
    await setGameToOpen(hostWs)

    sendMessage(p0, Channels.Bet, {bets: {"0": 20}})
    await onMessage(p0, Channels.Game, {credits: 997, odds: {'0': 0.9 }})

    sendMessage(p1, Channels.Bet, {bets: {"1": 10}})
    await onMessage(p1, Channels.Game, {credits: 980, odds: {"0":1.35,"1":2.7}})

    sendMessage(p2, Channels.Bet, {bets: {"2": 50, "3": 10}})
    await onMessage(p2, Channels.Game, {credits: 930, odds: {"0":4.05,"1":8.1,"2":1.62,"3":8.1}})

    server.sockets.setStep(10.0)
    await onMessage(hostWs, Channels.ChangeState, {state: 'Closed'})
    sendMessage(
      hostWs, Channels.ChangeState, {winners: ['3'], state: GameState.SelectedWinners}
    )
    await onMessage(
      p2, Channels.Game, { credits: 1011, prize: 81 }
    )

    await server.close()
  })

})

async function setupServer2(
  port: number, 
  jwtSecret: string,
  step: number = 1.0
): Promise<Server> {
  const sequelize = await setupSequelize()
  const server = await setupServer(port, jwtSecret, sequelize)
  server.sockets.setStep(step)
  return server
}

async function setupHostWs(server: Server, port: number) {
  await createHost(server)
  const hostLogin = await onHostLogin(server)

  return createWs(port, hostLogin.body.token)
}

async function setupPlayerWs(
  server: Server, 
  port: number, 
  mobile: string,
  credits: number,
): Promise<WebSocket> {
  await createPlayer(server, mobile)
  await updateWallet(mobile, 1000)
  const logPlayer = await loginPlayer(server, mobile)
  const playerWs = createWs(port, logPlayer.body.token)

  await wsOpen(playerWs)
  return playerWs
}


async function setGameToOpen(ws: WebSocket) {
  sendMessage(ws, Channels.ChangeState, {state: GameState.NewGame})
  await onMessage(ws, Channels.ChangeState, {state: GameState.NewGame})

  sendMessage(ws, Channels.ChangeState, {state: GameState.Open})
  await onMessage(ws, Channels.ChangeState, {state: GameState.Open})
}

async function updateWallet(mobile: string, amount: number) {
  const user = await User.findOne({where: {mobile: mobile}})
  const wallet = await Wallet.findOne({where: {userId: user.id}})
  wallet.credits = amount
  await wallet.save()
}
