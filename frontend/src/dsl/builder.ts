// API encadenable. Genera un `SessionDef` que el engine puede tocar.
//
// Ejemplo:
//   pulso()
//     .bpm(120)
//     .track('drums')
//       .drum('kick').pattern('x...x...x...x...')
//     .track('bass').volume(0.7)
//       .synth('saw').scale('Cm pent').notes("1 5 b7 1'").filter(400)
//     .play();

import type { DrumKind, SessionDef, TrackDef, VoiceDef, Wave } from "../types.ts";
import { parsePattern } from "./pattern.ts";
import { parseScale, resolveDegrees, looksLikeDegrees } from "./scales.ts";
import { parseNotes } from "./notation.ts";

export type PlayHandler = (session: SessionDef) => void;

let activeHandler: PlayHandler | null = null;

export function setPlayHandler(h: PlayHandler): void {
  activeHandler = h;
}

class PulsoBuilder {
  private session: SessionDef = { bpm: 120, tracks: [] };
  private currentTrack: TrackDef | null = null;
  private currentVoice: VoiceDef | null = null;

  bpm(v: number): this {
    this.session.bpm = v;
    return this;
  }

  track(name: string): this {
    let t = this.session.tracks.find((x) => x.name === name);
    if (!t) {
      t = { name, volume: 1, pan: 0, muted: false, soloed: false, voices: [] };
      this.session.tracks.push(t);
    }
    this.currentTrack = t;
    this.currentVoice = null;
    return this;
  }

  // ─── métodos de pista ────────────────────────────────────────
  volume(v: number): this {
    this.requireTrack().volume = clamp(v, 0, 1.5);
    return this;
  }
  pan(v: number): this {
    this.requireTrack().pan = clamp(v, -1, 1);
    return this;
  }
  mute(): this {
    this.requireTrack().muted = true;
    return this;
  }
  solo(): this {
    this.requireTrack().soloed = true;
    return this;
  }

  // ─── métodos de voz ──────────────────────────────────────────
  drum(kind: DrumKind): this {
    const t = this.ensureTrack();
    const v: VoiceDef = { kind: "drum", drumKind: kind };
    t.voices.push(v);
    this.currentVoice = v;
    return this;
  }

  synth(wave: Wave = "sine"): this {
    const t = this.ensureTrack();
    const v: VoiceDef = { kind: "synth", wave };
    t.voices.push(v);
    this.currentVoice = v;
    return this;
  }

  pattern(s: string): this {
    this.requireVoice().pattern = parsePattern(s);
    return this;
  }

  notes(s: string): this {
    const v = this.requireVoice();
    v.rawNotes = s;
    if (v.scale && looksLikeDegrees(s)) {
      const ref = parseScale(v.scale);
      v.notes = resolveDegrees(s, ref, v.scaleOctave ?? 4);
      v.scaleRoot = ref.pc;
    } else {
      v.notes = parseNotes(s);
    }
    return this;
  }

  scale(s: string): this {
    const v = this.requireVoice();
    v.scale = s;
    // si ya hay notas y son grados, recomputar
    if (v.rawNotes && looksLikeDegrees(v.rawNotes)) {
      const ref = parseScale(s);
      v.notes = resolveDegrees(v.rawNotes, ref, v.scaleOctave ?? 4);
      v.scaleRoot = ref.pc;
    }
    return this;
  }

  octave(n: number): this {
    this.requireVoice().scaleOctave = n;
    return this;
  }

  filter(hz: number): this { this.requireVoice().filter = hz; return this; }
  attack(s: number): this  { this.requireVoice().attack = s; return this; }
  decay(s: number): this   { this.requireVoice().decay = s; return this; }
  sustain(v: number): this { this.requireVoice().sustain = clamp(v, 0, 1); return this; }
  release(s: number): this { this.requireVoice().release = s; return this; }
  every(n: number): this   { this.requireVoice().every = Math.max(1, Math.floor(n)); return this; }
  wave(w: Wave): this      { this.requireVoice().wave = w; return this; }

  play(): SessionDef {
    if (this.session.tracks.length === 0) {
      // pista por defecto si no se llamó .track() pero hay voces flotantes (no debería pasar con la API correcta)
      this.session.tracks.push({ name: "main", volume: 1, pan: 0, muted: false, soloed: false, voices: [] });
    }
    if (activeHandler) activeHandler(this.session);
    return this.session;
  }

  // ─── helpers internos ────────────────────────────────────────
  private requireTrack(): TrackDef {
    if (!this.currentTrack) throw new Error("primero llama a .track(name)");
    return this.currentTrack;
  }
  private requireVoice(): VoiceDef {
    if (!this.currentVoice) throw new Error("primero llama a .drum(...) o .synth(...)");
    return this.currentVoice;
  }
  private ensureTrack(): TrackDef {
    if (this.currentTrack) return this.currentTrack;
    return this.track("main").currentTrack!;
  }
}

export function pulso(): PulsoBuilder {
  return new PulsoBuilder();
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}
