import { Channels, delay, GameState } from "../../src/utils/common";
import { createHost, createWs, onHostLogin, sendMessage, setupSequelize, setupServer, wsOnMessage, wsOpen } from "../Common";

const jwtSecret = "secret"

describe('HostWebsocket', () => {
  
  test('HostConnectionTest', async () => {
    const port = 6900
    const sequelize = await setupSequelize()
    const server = await setupServer(port, jwtSecret, sequelize)

    await createHost(server)
    const hostLogin = await onHostLogin(server)

    const wsHost = createWs(port, hostLogin.body.token)
    await wsOpen(wsHost)

    await delay(20) // Give time for socket in game to listen to message
    sendMessage(wsHost, Channels.Init, {})
    let msg = await wsOnMessage(wsHost)
    expect(msg.channel).toBe(Channels.Init)
    expect(msg.data).toEqual({state: 'Idle'})
    await server.close()
  })


  test('HostGameStateCycleTest', async () => {
    const port = 6901
    const sequelize = await setupSequelize()
    const server = await setupServer(port, jwtSecret, sequelize)
    server.sockets.gameManager.game.step = 10.0

    await createHost(server)
    const hostLogin = await onHostLogin(server)

    const wsHost = createWs(port, hostLogin.body.token)
    await wsOpen(wsHost)

    await delay(20) // Give time for socket in game to listen to message
    sendMessage(wsHost, Channels.Init, {})
    let msg = await wsOnMessage(wsHost)
    expect(msg.channel).toBe(Channels.Init)
    expect(msg.data).toEqual({state: 'Idle'})

    sendMessage(wsHost, Channels.ChangeState, {state: GameState.NewGame})
    msg = await wsOnMessage(wsHost)
    expect(msg.channel).toEqual(Channels.ChangeState)
    expect(msg.data).toEqual({state: GameState.NewGame})

    sendMessage(wsHost, Channels.ChangeState, {state: GameState.Open})
    msg = await wsOnMessage(wsHost)
    expect(msg.channel).toEqual(Channels.ChangeState)
    expect(msg.data).toEqual({state: GameState.Open})

    msg = await wsOnMessage(wsHost)
    expect(msg.channel).toEqual(Channels.Game)
    expect(msg.data).toEqual({countDown: 4})

    msg = await wsOnMessage(wsHost)
    expect(msg.data).toEqual({countDown: 3})

    msg = await wsOnMessage(wsHost)
    expect(msg.data).toEqual({countDown: 2})

    msg = await wsOnMessage(wsHost)
    expect(msg.data).toEqual({countDown: 1})

    msg = await wsOnMessage(wsHost)
    expect(msg.data).toEqual({countDown: 0})

    msg = await wsOnMessage(wsHost)
    expect(msg.data).toEqual({state: GameState.Closed})

    sendMessage(
      wsHost, Channels.ChangeState, 
      {winners: ['0'], state: GameState.SelectedWinners}
    )

    msg = await wsOnMessage(wsHost)
    expect(msg.channel).toEqual(Channels.ChangeState)
    expect(msg.data).toEqual({state: GameState.SelectedWinners})

    sendMessage(wsHost, Channels.ChangeState, {state: GameState.NewGame})
    msg = await wsOnMessage(wsHost)
    expect(msg.channel).toEqual(Channels.ChangeState)
    expect(msg.data).toEqual({state: GameState.NewGame})

    await server.close()
  })

})


