type TickCallback = (deltaMs: number) => void;

/**
 * Fixed-timestep game logic loop, decoupled from the rendering loop.
 * The game ticks at TICK_MS intervals; rendering continues at 60 FPS.
 */
export class GameLoop {
  private tickCallbacks: TickCallback[] = [];
  private tickInterval: number;
  private accumulator = 0;
  private running = false;

  constructor(tickInterval = 250) {
    this.tickInterval = tickInterval;
  }

  start(onTick: TickCallback): void {
    this.running = true;
    this.tickCallbacks.push(onTick);
  }

  stop(): void {
    this.running = false;
  }

  update(deltaSeconds: number): void {
    if (!this.running) return;
    this.accumulator += deltaSeconds * 1000;
    let safety = 0;
    while (this.accumulator >= this.tickInterval && safety < 8) {
      this.accumulator -= this.tickInterval;
      for (const cb of this.tickCallbacks) cb(this.tickInterval);
      safety++;
    }
    if (safety >= 8) this.accumulator = 0;
  }
}
