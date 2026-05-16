// Drums sintetizados (sin samples).
// kick = sine sweep + click; snare = noise + body; hat = noise highpass; clap = noise stacked.

import { getCtx } from "./context.ts";
import type { DrumKind } from "../types.ts";
import type { Instrument, PlayCtx } from "./voice.ts";

export function makeDrum(kind: DrumKind): Instrument {
  switch (kind) {
    case "kick":    return { trigger: kick };
    case "snare":   return { trigger: snare };
    case "hat":     return { trigger: hat };
    case "clap":    return { trigger: clap };
    case "tom":     return { trigger: tom };
    case "rim":     return { trigger: rim };
    case "cowbell": return { trigger: cowbell };
    case "ride":    return { trigger: ride };
    case "shaker":  return { trigger: shaker };
    case "perc":    return { trigger: perc };
  }
}

function kick({ when, destination }: PlayCtx): void {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(150, when);
  osc.frequency.exponentialRampToValueAtTime(40, when + 0.08);
  gain.gain.setValueAtTime(0, when);
  gain.gain.linearRampToValueAtTime(1, when + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, when + 0.5);
  osc.connect(gain).connect(destination);
  osc.start(when);
  osc.stop(when + 0.6);
}

function snare({ when, destination }: PlayCtx): void {
  const ctx = getCtx();
  const noise = noiseSource(0.3);
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 1200;
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(0.7, when);
  ng.gain.exponentialRampToValueAtTime(0.001, when + 0.2);
  noise.connect(hp).connect(ng).connect(destination);
  noise.start(when);
  noise.stop(when + 0.25);

  // body
  const body = ctx.createOscillator();
  const bg = ctx.createGain();
  body.type = "triangle";
  body.frequency.setValueAtTime(200, when);
  body.frequency.exponentialRampToValueAtTime(120, when + 0.1);
  bg.gain.setValueAtTime(0.4, when);
  bg.gain.exponentialRampToValueAtTime(0.001, when + 0.15);
  body.connect(bg).connect(destination);
  body.start(when);
  body.stop(when + 0.18);
}

function hat({ when, destination }: PlayCtx): void {
  const ctx = getCtx();
  const noise = noiseSource(0.05);
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 7000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.4, when);
  g.gain.exponentialRampToValueAtTime(0.001, when + 0.04);
  noise.connect(hp).connect(g).connect(destination);
  noise.start(when);
  noise.stop(when + 0.06);
}

function clap({ when, destination }: PlayCtx): void {
  // tres bursts cortos para emular handclap.
  for (let i = 0; i < 3; i++) {
    const ctx = getCtx();
    const t = when + i * 0.012;
    const noise = noiseSource(0.05);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1200;
    bp.Q.value = 0.8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.6, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    noise.connect(bp).connect(g).connect(destination);
    noise.start(t);
    noise.stop(t + 0.08);
  }
}

// Tom grave: sine sweep 120→60 Hz con cuerpo largo.
function tom({ when, destination }: PlayCtx): void {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(120, when);
  osc.frequency.exponentialRampToValueAtTime(55, when + 0.18);
  gain.gain.setValueAtTime(0, when);
  gain.gain.linearRampToValueAtTime(0.85, when + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, when + 0.55);
  osc.connect(gain).connect(destination);
  osc.start(when);
  osc.stop(when + 0.6);
}

// Rim shot: bandpass picado en 2.5kHz, muy corto.
function rim({ when, destination }: PlayCtx): void {
  const ctx = getCtx();
  const noise = noiseSource(0.04);
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 2500;
  bp.Q.value = 8;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.7, when);
  g.gain.exponentialRampToValueAtTime(0.001, when + 0.035);
  noise.connect(bp).connect(g).connect(destination);
  noise.start(when);
  noise.stop(when + 0.05);
}

// Cowbell: dos squares (560+800) por bandpass — sonido latin metálico.
function cowbell({ when, destination }: PlayCtx): void {
  const ctx = getCtx();
  const o1 = ctx.createOscillator();
  const o2 = ctx.createOscillator();
  o1.type = "square"; o2.type = "square";
  o1.frequency.value = 560; o2.frequency.value = 800;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, when);
  gain.gain.linearRampToValueAtTime(0.45, when + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.001, when + 0.4);
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass"; bp.frequency.value = 800; bp.Q.value = 1;
  o1.connect(gain); o2.connect(gain);
  gain.connect(bp).connect(destination);
  o1.start(when); o2.start(when);
  o1.stop(when + 0.45); o2.stop(when + 0.45);
}

// Ride: noise highpass largo (250ms), mantiene cuerpo.
function ride({ when, destination }: PlayCtx): void {
  const ctx = getCtx();
  const noise = noiseSource(0.3);
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 5000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.32, when);
  g.gain.exponentialRampToValueAtTime(0.001, when + 0.25);
  noise.connect(hp).connect(g).connect(destination);
  noise.start(when);
  noise.stop(when + 0.3);
}

// Shaker: similar a hat pero menos agresivo (más airoso).
function shaker({ when, destination }: PlayCtx): void {
  const ctx = getCtx();
  const noise = noiseSource(0.05);
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 6000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.22, when);
  g.gain.exponentialRampToValueAtTime(0.001, when + 0.06);
  noise.connect(hp).connect(g).connect(destination);
  noise.start(when);
  noise.stop(when + 0.08);
}

// Perc genérica: bandpass en 1.5kHz con cola corta.
function perc({ when, destination }: PlayCtx): void {
  const ctx = getCtx();
  const noise = noiseSource(0.08);
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1500;
  bp.Q.value = 3;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.5, when);
  g.gain.exponentialRampToValueAtTime(0.001, when + 0.1);
  noise.connect(bp).connect(g).connect(destination);
  noise.start(when);
  noise.stop(when + 0.12);
}

function noiseSource(seconds: number): AudioBufferSourceNode {
  const ctx = getCtx();
  const len = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  return src;
}
