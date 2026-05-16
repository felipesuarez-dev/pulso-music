// Presets de instrumento: atajos que aplican wave + filter + ADSR de una vez.
// No agregan capacidades nuevas — son composiciones de los modificadores existentes.
// IMPORTANTE: Pulso no tiene samples reales. Estos presets IMITAN timbres con síntesis;
// no van a sonar idénticos a un Stradivarius o una Les Paul, pero capturan el carácter.

import type { VoiceDef, Wave } from "../types.ts";

export type PresetName =
  | "8bit-lead" | "8bit-bass" | "8bit-arp"
  | "rock-bass" | "rock-lead" | "guitar-acoustic" | "guitar-electric"
  | "piano" | "violin" | "flute" | "organ" | "bell"
  | "pad-warm" | "pad-cold" | "sub-bass" | "pluck";

export interface PresetDef {
  wave: Wave;
  filter: number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  description: string;
}

export const PRESETS: Record<PresetName, PresetDef> = {
  "8bit-lead":       { wave: "square",   filter: 3500, attack: 0.005, decay: 0.08, sustain: 0.6, release: 0.10,
    description: "Lead chiptune Game Boy / NES. Square brillante, ataque instantáneo, cola corta." },
  "8bit-bass":       { wave: "square",   filter:  700, attack: 0.005, decay: 0.05, sustain: 0.8, release: 0.10,
    description: "Bajo Game Boy retro. Square filtrado, cuerpo definido, sin cola." },
  "8bit-arp":        { wave: "square",   filter: 2800, attack: 0.005, decay: 0.03, sustain: 0.4, release: 0.08,
    description: "Arpegio Game Boy. Square picado para notas rápidas (Pokemon battle vibes)." },
  "rock-bass":       { wave: "sawtooth", filter:  480, attack: 0.005, decay: 0.06, sustain: 0.7, release: 0.12,
    description: "Bajo rock. Saw filtrada con cuerpo, simula bajo eléctrico con dedos." },
  "rock-lead":       { wave: "sawtooth", filter: 2400, attack: 0.010, decay: 0.08, sustain: 0.7, release: 0.30,
    description: "Lead rock con saturación. Saw brillante, sostiene la nota." },
  "guitar-acoustic": { wave: "triangle", filter: 1800, attack: 0.010, decay: 0.15, sustain: 0.4, release: 0.50,
    description: "Guitarra acústica. Triangle dulce, ataque suave, decay natural." },
  "guitar-electric": { wave: "sawtooth", filter: 2200, attack: 0.005, decay: 0.08, sustain: 0.6, release: 0.25,
    description: "Guitarra eléctrica clean. Saw filtrada, decay rockero." },
  "piano":           { wave: "triangle", filter: 2400, attack: 0.005, decay: 0.30, sustain: 0.0, release: 0.40,
    description: "Piano. Triangle con decay largo y sin sustain (las teclas no sostienen)." },
  "violin":          { wave: "sine",     filter: 1600, attack: 0.400, decay: 0.10, sustain: 0.7, release: 0.80,
    description: "Violín. Sine con attack LENTO (400ms) — entra suave como un arco." },
  "flute":           { wave: "sine",     filter: 2200, attack: 0.050, decay: 0.05, sustain: 0.8, release: 0.30,
    description: "Flauta. Sine breve y brillante, sustain alto." },
  "organ":           { wave: "square",   filter: 1400, attack: 0.050, decay: 0.00, sustain: 1.0, release: 0.20,
    description: "Órgano. Square sostenido total (sustain 100%, sin decay)." },
  "bell":            { wave: "triangle", filter: 3500, attack: 0.001, decay: 0.50, sustain: 0.0, release: 0.80,
    description: "Campana / chime. Triangle brillante con decay y cola larga." },
  "pad-warm":        { wave: "triangle", filter: 1100, attack: 0.400, decay: 0.30, sustain: 0.7, release: 1.20,
    description: "Pad cálido. Triangle sostenido, entra y sale lento (atmósfera)." },
  "pad-cold":        { wave: "sine",     filter: 2000, attack: 0.600, decay: 0.40, sustain: 0.6, release: 1.50,
    description: "Pad frío / sci-fi. Sine etérea, attack ultra lento." },
  "sub-bass":        { wave: "sine",     filter:  180, attack: 0.005, decay: 0.05, sustain: 0.9, release: 0.60,
    description: "Sub-bajo. Sine grave filtrada bajo, sostiene mucha presencia." },
  "pluck":           { wave: "sine",     filter: 1600, attack: 0.001, decay: 0.04, sustain: 0.0, release: 0.15,
    description: "Pluck percusivo. Sine con attack instantáneo y decay cortísimo (tipo dedo)." },
};

export function listPresets(): PresetName[] {
  return Object.keys(PRESETS) as PresetName[];
}

export function applyPreset(voice: VoiceDef, name: PresetName): void {
  const p = PRESETS[name];
  if (!p) throw new Error(`preset desconocido: "${name}"`);
  voice.wave = p.wave;
  voice.filter = p.filter;
  voice.attack = p.attack;
  voice.decay = p.decay;
  voice.sustain = p.sustain;
  voice.release = p.release;
}
