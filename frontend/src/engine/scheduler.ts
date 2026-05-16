// Scheduler con lookahead (patrón Chris Wilson).
// El reloj de audio (audioContext.currentTime) es estable; setInterval no.
// Miramos hacia adelante `lookahead` segundos y programamos eventos en ese horizonte.

import { getCtx } from "./context.ts";

export type TickCb = (audioTime: number, step: number, cycle: number) => void;

export class Scheduler {
  private interval: number | null = null;
  private nextTickAt = 0;
  private step = 0;
  private cycle = 0;
  private bpm = 120;
  private steps = 16; // 16 steps por ciclo (= 4 beats de 16th notes)
  private readonly lookahead = 0.1; // segundos
  private readonly tickMs = 25;
  private cb: TickCb | null = null;

  constructor() {
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && this.interval !== null) {
        this.nextTickAt = getCtx().currentTime + this.lookahead;
      }
    });
  }

  setBpm(bpm: number): void {
    this.bpm = Math.max(20, Math.min(400, bpm));
  }

  start(cb: TickCb): void {
    this.stop();
    this.cb = cb;
    this.step = 0;
    this.cycle = 0;
    this.nextTickAt = getCtx().currentTime + 0.05;
    this.interval = window.setInterval(() => this.poll(), this.tickMs);
  }

  stop(): void {
    if (this.interval !== null) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.cb = null;
  }

  isRunning(): boolean {
    return this.interval !== null;
  }

  private poll(): void {
    if (!this.cb) return;
    const ctx = getCtx();
    const horizon = ctx.currentTime + this.lookahead;
    const secPerStep = 60 / this.bpm / 4;
    while (this.nextTickAt < horizon) {
      this.cb(this.nextTickAt, this.step, this.cycle);
      this.nextTickAt += secPerStep;
      this.step = (this.step + 1) % this.steps;
      if (this.step === 0) this.cycle++;
    }
  }
}
