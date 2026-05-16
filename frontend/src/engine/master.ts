// Bus master con AnalyserNode global. Todas las pistas llegan aquí.

import { getCtx } from "./context.ts";

export interface MasterBus {
  input: AudioNode;
  analyser: AnalyserNode;
  gain: GainNode;
}

let bus: MasterBus | null = null;

export function getMaster(): MasterBus {
  if (bus) return bus;
  const ctx = getCtx();
  const gain = ctx.createGain();
  gain.gain.value = 0.85;
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.8;
  gain.connect(analyser);
  analyser.connect(ctx.destination);
  bus = { input: gain, analyser, gain };
  return bus;
}
