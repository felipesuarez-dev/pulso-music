// Bus por pista: gain + pan + analyser propio + mute/solo.

import { getCtx } from "./context.ts";
import { getMaster } from "./master.ts";

export class TrackBus {
  readonly input: GainNode;       // entrada de las voces
  readonly analyser: AnalyserNode;
  private readonly gain: GainNode; // controla volumen
  private readonly panner: StereoPannerNode;
  private _muted = false;
  private _soloed = false;
  private effectiveMute = false;

  constructor(public readonly name: string) {
    const ctx = getCtx();
    this.input = ctx.createGain();        // siempre 1 (puente)
    this.gain = ctx.createGain();
    this.panner = ctx.createStereoPanner();
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 1024;
    this.input.connect(this.gain);
    this.gain.connect(this.panner);
    this.panner.connect(this.analyser);
    this.analyser.connect(getMaster().input);
  }

  setVolume(v: number): void {
    this.gain.gain.value = clamp(v, 0, 1.5) * (this.effectiveMute ? 0 : 1);
    this._volume = clamp(v, 0, 1.5);
  }

  setPan(p: number): void {
    this.panner.pan.value = clamp(p, -1, 1);
  }

  applyMute(effective: boolean): void {
    this.effectiveMute = effective;
    this.gain.gain.value = effective ? 0 : this._volume;
  }

  set muted(v: boolean) { this._muted = v; }
  get muted(): boolean { return this._muted; }
  set soloed(v: boolean) { this._soloed = v; }
  get soloed(): boolean { return this._soloed; }

  private _volume = 1;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}
