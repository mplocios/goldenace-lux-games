import { AutomationPlugin } from "../../../src/game/components/automation/Automation"
import { AutoChannel } from "../../../src/game/components/automation/StarterPlugin"
import { GameManager } from "../../../src/game/GameManager"
import { delay, GameState } from "../../../src/utils/common";
import { reply, sendMessage, setupHostWs, setupSequelize, setupServer2 } from "../../Common"
import WebSocket from 'ws';

const jwtSecret = "secret"

describe('AutoGameCycleTest.test', () => {

  test('AutoCycle', async () => {
    const port = 6920
    const sequelize = await setupSequelize()
    const gameManager = new GameManager().addPlugin(new AutomationPlugin)
    const server = await setupServer2(port, jwtSecret, sequelize, gameManager)
    server.sockets.gameManager.game.step = 10.0

    const hostWs = await setupHostWs(server, port)
    sendMessage(hostWs, AutoChannel.Start, {test: "test"})

    let rep = await reply(hostWs)
    expect(rep.data.state).toBe(GameState.NewGame)

    rep = await reply(hostWs)
    expect(rep.data.state).toBe(GameState.Open)

    rep = await reply(hostWs)
    expect(rep.data).toEqual({countDown: 4})

    rep = await reply(hostWs)
    expect(rep.data).toEqual({countDown: 3})

    rep = await reply(hostWs)
    expect(rep.data).toEqual({countDown: 2})

    rep = await reply(hostWs)
    expect(rep.data).toEqual({countDown: 1})

    rep = await reply(hostWs)
    expect(rep.data).toEqual({countDown: 0})

    rep = await reply(hostWs)
    expect(rep.data).toEqual({state: GameState.Closed})

    rep = await reply(hostWs)
    expect(rep.data).toEqual({countDown: 4})

    rep = await reply(hostWs)
    expect(rep.data).toEqual({countDown: 3})

    rep = await reply(hostWs)
    expect(rep.data).toEqual({countDown: 2})

    rep = await reply(hostWs)
    expect(rep.data).toEqual({countDown: 1})

    rep = await reply(hostWs)
    expect(rep.data).toEqual({countDown: 0})

    rep = await reply(hostWs)
    expect(rep.data).toEqual({state: GameState.SelectedWinners})

    rep = await reply(hostWs)
    expect(rep.data).toEqual({countDown: 4})

    rep = await reply(hostWs)
    expect(rep.data).toEqual({countDown: 3})

    rep = await reply(hostWs)
    expect(rep.data).toEqual({countDown: 2})

    rep = await reply(hostWs)
    expect(rep.data).toEqual({countDown: 1})

    rep = await reply(hostWs)
    expect(rep.data).toEqual({countDown: 0})

    rep = await reply(hostWs)
    expect(rep.data.state).toBe(GameState.NewGame)

    rep = await reply(hostWs)
    expect(rep.data.state).toBe(GameState.Open)

    rep = await reply(hostWs)
    expect(rep.data).toEqual({countDown: 4})

    rep = await reply(hostWs)
    expect(rep.data).toEqual({countDown: 3})

    rep = await reply(hostWs)
    expect(rep.data).toEqual({countDown: 2})

    rep = await reply(hostWs)
    expect(rep.data).toEqual({countDown: 1})

    rep = await reply(hostWs)
    expect(rep.data).toEqual({countDown: 0})

    rep = await reply(hostWs)
    expect(rep.data).toEqual({state: GameState.Closed})

    rep = await reply(hostWs)
    expect(rep.data).toEqual({countDown: 4})

    rep = await reply(hostWs)
    expect(rep.data).toEqual({countDown: 3})

    rep = await reply(hostWs)
    expect(rep.data).toEqual({countDown: 2})

    rep = await reply(hostWs)
    expect(rep.data).toEqual({countDown: 1})

    rep = await reply(hostWs)
    expect(rep.data).toEqual({countDown: 0})

    rep = await reply(hostWs)
    expect(rep.data).toEqual({state: GameState.SelectedWinners})

    rep = await reply(hostWs)
    expect(rep.data).toEqual({countDown: 4})

    rep = await reply(hostWs)
    expect(rep.data).toEqual({countDown: 3})

    rep = await reply(hostWs)
    expect(rep.data).toEqual({countDown: 2})

    rep = await reply(hostWs)
    expect(rep.data).toEqual({countDown: 1})

    rep = await reply(hostWs)
    expect(rep.data).toEqual({countDown: 0})

    rep = await reply(hostWs)
    expect(rep.data.state).toBe(GameState.NewGame)

    server.close()
  })
})
