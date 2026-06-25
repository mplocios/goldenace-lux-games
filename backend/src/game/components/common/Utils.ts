export class Interval {
  interval: number
  repeat: number
  duration: number = 0.0

  constructor(interval: number, repeat: number) {
    this.interval = interval
    this.repeat = repeat
  }

  isCalled(delta: number): boolean {
    if (this.duration >= this.interval) {
      this.duration -= this.interval
      this.repeat -= 1
      return true
    } else {
      this.duration += delta
    }
    return false
  }

  isDone(): boolean {
    return this.repeat <= 0
  }
}