// Sintetizador melódico: oscilador + filtro lowpass + envelope ADSR.

import { getCtx } from "./context.ts";
import { midiToHz } from "../dsl/notes.ts";
import type { VoiceDef, Wave } from "../types.ts";
import type { Instrument, PlayCtx } from "./voice.ts";

export function makeSynth(def: VoiceDef): Instrument {
  const wave: Wave = def.wave ?? "sine";
  const filter = def.filter ?? 8000;
  const a = def.attack ?? 0.005;
  const d = def.decay ?? 0.08;
  const s = def.sustain ?? 0.6;
  const r = def.release ?? 0.2;
  const noteLen = 0.18;

  return {
    trigger({ when, destination, midi }: PlayCtx): void {
      if (midi == null || midi < 0) return;
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const lp = ctx.createBiquadFilter();
      const env = ctx.createGain();
      osc.type = wave;
      osc.frequency.value = midiToHz(midi);
      lp.type = "lowpass";
      lp.frequency.value = filter;
      lp.Q.value = 0.7;
      env.gain.setValueAtTime(0, when);
      env.gain.linearRampToValueAtTime(1, when + a);
      env.gain.linearRampToValueAtTime(s, when + a + d);
      env.gain.linearRampToValueAtTime(s, when + a + d + noteLen);
      env.gain.exponentialRampToValueAtTime(0.001, when + a + d + noteLen + r);
      osc.connect(lp).connect(env).connect(destination);
      osc.start(when);
      osc.stop(when + a + d + noteLen + r + 0.05);
    },
  };
}
