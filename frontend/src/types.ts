// Tipos compartidos del DSL y del engine.

export type DrumKind =
  | "kick" | "snare" | "hat" | "clap"
  | "tom" | "rim" | "cowbell" | "ride" | "shaker" | "perc";
export type Wave = "sine" | "square" | "sawtooth" | "triangle";

export interface VoiceDef {
  kind: "drum" | "synth";
  // drum-only
  drumKind?: DrumKind;
  // synth-only
  wave?: Wave;
  filter?: number;
  attack?: number;
  decay?: number;
  sustain?: number;
  release?: number;
  // común
  pattern?: boolean[];
  notes?: number[];      // MIDI o token: -1 = sustain (_), -2 = rest (.)
  every?: number;        // suena 1 de cada N ciclos (default 1)
  scale?: string;        // alias canónico de escala (p.ej. "minor", "pentatonicMin")
  scaleRoot?: number;    // pitch class (0..11) de la tónica
  scaleOctave?: number;  // octava base para grados (default 4)
  rawNotes?: string;     // texto original (para debug y export MIDI)
  during?: [number, number]; // rango de ciclos [inicio, fin] (ambos inclusive)
}

export interface TrackDef {
  name: string;
  volume: number;  // 0..1
  pan: number;     // -1..1
  muted: boolean;
  soloed: boolean;
  voices: VoiceDef[];
}

export interface SessionDef {
  bpm: number;
  tracks: TrackDef[];
  songLength?: number;  // si se define, el contador de ciclos se envuelve mod N
}

export type Notation = "anglo" | "latina";
export type Lang = "es" | "en";
