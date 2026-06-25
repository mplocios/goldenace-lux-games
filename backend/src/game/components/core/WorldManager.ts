import WebSocket from 'ws';
type ClassType<T> = new (...args: any[]) => T;

export class Input {
	json: any;
  constructor(json: any) {
    this.json = json
  }
}

import { World } from 'uecs';
import { GameState } from '../../../utils/common';

export class Game extends World {
  step = 1.0 // How fast the tick, needed for testing
  delta = 0.0;
  running = false;
  paused = false
  private initSystems: any[] = [];
  private beforeSystems: any[] = [];
  private currentSystems: any[][] = [];
  private afterSystems: any[] = [];
  
  private queuedEvents: Event[] = []
  /** Read only, do not modify this shit */
  events: Event[] = []
  global: Map<String, any> = new Map();

  public static wsType: ClassType<any>;

  private static TOTAL_SYSTEMS = 11
  constructor() {
    super()
    Game.wsType = WebSocket

    for (let i = 0; i <= Game.TOTAL_SYSTEMS; i++) {
      this.currentSystems.push([])
    }
  }

  addPlugin(plugin: Plugin) {
    plugin.build(this);
    return this;
  }
  init(system: any) {
    this.initSystems.push(system);
    return this;
  }
  before(system: any) {
    this.beforeSystems.push(system);
    return this;
  }

  /** priority: default 0, range -5 to 5 */
  system(system: any, priority = 0) {
    if (priority < -5 || priority > 5) {
      throw("Priority can only be between -5 to 5")
    }
    
    let mid = Math.floor(Game.TOTAL_SYSTEMS / 2)
    this.currentSystems[mid + priority].push(system);
    return this;
  }
  after(system: any) {
    this.afterSystems.push(system);
    return this;
  }
  async run() {
    this.running = true;

    this.initSystems.forEach((s) => {
      s(this);
    });

    const fps = 60.0;
    const interval = 1000.0 / fps;

    while (this.running) {
      this.delta = interval / 1000.0; // FIXME: Change to real delta later
      const timeTick = interval / this.step
      await new Promise(resolve => setTimeout(resolve, timeTick));
      
      if (this.paused) {
        continue
      }
      
      this.updateEvents()
      this.beforeSystems.forEach((s) => {
        s(this);
      });
      this.currentSystems.forEach((val) => {
        val.forEach((s) => {
          s(this)
        })
      })
      this.afterSystems.forEach((s) => {
        s(this);
      });
    }
  }
  async loaded() {
    return new Promise<void>(resolve => {
      const interval = setInterval(() => {
        if (this.running) {
          clearInterval(interval);
          resolve();
        }
      }, 1000 / 30);
    });
  }
  stop() {
    this.running = false;
  }

  fireEvent(event: Event, fireOnce: boolean = true) {
    if (fireOnce) {
      this.queuedEvents.forEach((e) => {
        if (!isEqual(event, e)) {
          this.queuedEvents.push(event)
        } else {
          console.error("Event is already queued", e)
        }
      })

      if (this.queuedEvents.length === 0) {
        this.queuedEvents.push(event)
      }
    } else {
      this.queuedEvents.push(event)
    }
  }

  private updateEvents() {
    this.events = []
    this.events = this.events.concat(this.queuedEvents)
    this.queuedEvents = []
  }

  setStep(s: number) {
    this.step = s
  }
  
  private updateOnce = false;

  /** For testing plugins */
  update() {
    // this.currentSystems.forEach((s) => {
    //   s(this);
    // });
  }
}

function isEqual(e1: Event, e2: Event) {
  if (
    (e1.type === e2.type && 
    JSON.stringify(e1.msg) === JSON.stringify(e2.msg))
  ) {
    return true
  }
  return false
}

export class Event {
  public type: string
  public msg: Message

  constructor(type: string, msg: Message) {
    this.type = type
    this.msg = msg;
  }
}

class Message {
  channel: string
  data: any
}


export interface Plugin {
  build(game: Game): void;
}

export class GameData {
  winners: string[] = []
	state: GameState = GameState.Idle;
  countDown: number
  defaultCountDown: number

  playingCountDown: number
  newRoundCountDown: number

  constructor(
    state: GameState, 
    countDown: number,
    playingCountDown: number,
    newRoundCountDown: number
  ) {
    this.state = state
    this.countDown = countDown
    this.defaultCountDown = countDown
    this.playingCountDown = playingCountDown
    this.newRoundCountDown = newRoundCountDown
  }

  reset() {
    this.countDown = this.defaultCountDown
    this.winners = []
  }
}

export class GameStateChanged { }

export class Winner {
  uuid: string;
  prize: number;
  constructor(uuid: string, prize: number) {
    this.uuid = uuid;
    this.prize = prize;
  }
}

