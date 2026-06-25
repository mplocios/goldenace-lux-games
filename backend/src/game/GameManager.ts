import { Entity } from 'uecs';
import { GameState } from '../utils/common';
import { CorePlugin } from './components/core/CorePlugin';
import { SocketPlugin } from './components/core/SocketPlugin';
import { User, UserTag } from './components/core/UserPlugin';
import { Game, GameData, Plugin } from './components/core/WorldManager';
import { BoatRacePlugin } from './components/boatrace/BoatRacePlugin';
import { HeartBeat } from './components/core/HeartbeatPlugin';
import { AutomationPlugin } from './components/automation/Automation';



export class GameManager {
  loaded = false;
  game: Game;
  constructor() {
    this.game = new Game()

    const COUNTDOWN: number = Number(process.env.COUNTDOWN || 5)
    const PLAYING_COUNTDOWN: number = Number(process.env.PLAYING_COUNTDOWN || 5)
    const NEWROUND_COUNTDOWN: number = Number(process.env.NEWROUND_COUNTDOWN || 5)
    let gameData = new GameData(
      GameState.Idle, 
      COUNTDOWN, 
      PLAYING_COUNTDOWN,
      NEWROUND_COUNTDOWN
    )

    this
      .game
      .global.set("GameData", gameData)
  }

  addPlugin(plugin: Plugin) {
    this.game.addPlugin(plugin)
    return this
  }

  public load(socket, user: User) {
    // console.log("load user", user.payload.type)
    this.game.create(
      user, 
      new UserTag, 
      socket,
      new HeartBeat
    )
  }

  public stop() {
    let game = this.game
    game.stop();
    game
      .view(Game.wsType)
      .each((entity: Entity, socket) => {
        socket.close();
        game.destroy(entity)
      });
  }

  public isRunning() {
    return this.game.running
  }
}