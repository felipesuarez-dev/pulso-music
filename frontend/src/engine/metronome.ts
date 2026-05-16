// Metrónomo: click sintético en cada beat (steps 0, 4, 8, 12 de un ciclo de 16).
// Acento en el downbeat (step 0): pitch más agudo y un poco más fuerte.
//
// Se conecta directo al bus master (pasa por el master gain, así sigue el volumen
// global). NO se mezcla en las pistas individuales — es un monitor, no música.
// Por la misma razón, NO se incluye en el export MIDI.

import { getCtx } from "./context.ts";
import { getMaster } from "./master.ts";

const BEAT_STEPS = new Set([0, 4, 8, 12]);

export class Metronome {
  private _enabled = false;

  setEnabled(on: boolean): void {
    this._enabled = on;
  }

  isEnabled(): boolean {
    return this._enabled;
  }

  // Llamado por el runtime en cada tick del scheduler.
  tick(when: number, step: number): void {
    if (!this._enabled) return;
    if (!BEAT_STEPS.has(step)) return;
    const accent = step === 0;
    this.click(when, accent);
  }

  private click(when: number, accent: boolean): void {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = accent ? 1500 : 800;   // downbeat más agudo
    const peak = accent ? 0.55 : 0.30;
    const dur  = accent ? 0.05 : 0.04;
    gain.gain.setValueAtTime(0, when);
    gain.gain.linearRampToValueAtTime(peak, when + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.001, when + dur);
    osc.connect(gain).connect(getMaster().input);
    osc.start(when);
    osc.stop(when + dur + 0.02);
  }
}
