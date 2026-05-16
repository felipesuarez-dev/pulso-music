// Interfaz común a todos los instrumentos.

import type { VoiceDef } from "../types.ts";

export interface PlayCtx {
  when: number;       // audioContext.currentTime + offset
  destination: AudioNode;
  midi?: number;      // pitch para sintes melódicos
}

export interface Instrument {
  trigger(ctx: PlayCtx): void;
}

// Decide qué nota corresponde al step `s` del ciclo.
// Retorna -2 (silencio), -1 (sustain) o un número MIDI (0..127).
export function noteForStep(notes: number[] | undefined, s: number): number {
  if (!notes || notes.length === 0) return -2;
  return notes[s % notes.length] ?? -2;
}

// Se respeta `every`: una voz suena sólo en ciclos donde cycle % every === 0.
export function shouldPlayCycle(def: VoiceDef, cycle: number): boolean {
  const e = def.every ?? 1;
  return e <= 1 || cycle % e === 0;
}
