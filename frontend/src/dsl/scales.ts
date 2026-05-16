// Escalas + resolver de grados.
//
// Uso:
//   const root = parseScaleName("Cm pentatonic")         // {pc: 0, scale: "pentatonicMin"}
//   const root = parseScaleName("DO menor pentatónica") // mismo resultado
//   resolveDegree("1 b3 5 1' b7", root, octBase=4) → [60, 63, 67, 72, 70]

import { pitchClassFromName } from "./notation.ts";

export const SCALES: Record<string, readonly number[]> = {
  major:         [0, 2, 4, 5, 7, 9, 11],
  minor:         [0, 2, 3, 5, 7, 8, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  pentatonicMin: [0, 3, 5, 7, 10],
  pentatonicMaj: [0, 2, 4, 7, 9],
  blues:         [0, 3, 5, 6, 7, 10],
  dorian:        [0, 2, 3, 5, 7, 9, 10],
  mixolydian:    [0, 2, 4, 5, 7, 9, 10],
  phrygian:      [0, 1, 3, 5, 7, 8, 10],
  lydian:        [0, 2, 4, 6, 7, 9, 11],
  chromatic:     [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
};

const SCALE_ALIASES: Record<string, string> = {
  // mayor
  "major": "major", "maj": "major", "mayor": "major", "M": "major",
  // menor
  "minor": "minor", "min": "minor", "menor": "minor", "m": "minor",
  // pentatónica
  "pentatonic": "pentatonicMin", "pent": "pentatonicMin", "pentatónica": "pentatonicMin",
  "pentatonicmin": "pentatonicMin",
  "pentatonicmaj": "pentatonicMaj",
  // otros
  "blues": "blues",
  "dorian": "dorian", "dórico": "dorian", "dorica": "dorian",
  "mixolydian": "mixolydian", "mixolidio": "mixolydian", "mixolidia": "mixolydian",
  "phrygian": "phrygian", "frigio": "phrygian", "frigia": "phrygian",
  "lydian": "lydian", "lidio": "lydian", "lidia": "lydian",
  "harmonicminor": "harmonicMinor", "harmonic": "harmonicMinor", "armónica": "harmonicMinor", "armonica": "harmonicMinor",
  "chromatic": "chromatic", "cromática": "chromatic", "cromatica": "chromatic",
};

export interface ScaleRef {
  pc: number;          // 0..11 — pitch class de la tónica
  scale: string;       // alias canónico
  intervals: readonly number[];
}

// Parsea entrada como "Cm", "Cm pentatonic", "DO menor pentatónica", etc.
// Primer token = tónica. Resto = nombre escala (o sufijo m/M directo).
export function parseScale(input: string): ScaleRef {
  const tokens = input.trim().split(/\s+/).filter((t) => t.length > 0);
  if (tokens.length === 0) throw new Error("escala vacía");
  const first = tokens[0]!;
  // separar tónica de posible sufijo "m"/"M" pegado: "Cm" → tónica "C", suffix "m"
  const m = /^([A-Ga-g][#b♯♭]?|do|re|mi|fa|sol|la|si)([#b♯♭]?)([mM])?$/.exec(first);
  let rootName = first;
  let suffix = "";
  if (m && (m[3] === "m" || m[3] === "M")) {
    rootName = (m[1] ?? "") + (m[2] ?? "");
    suffix = m[3];
    // si es "do" o "re" etc. con mayúscula, m podría confundir; reintenta sin sufijo si root inválido
  }
  const pc = pitchClassFromName(rootName);
  // reconstruir nombre de escala: suffix + tokens[1..]
  const rest = (suffix ? [suffix] : []).concat(tokens.slice(1));
  const scaleAlias = rest.length === 0 ? "major" : rest.join("").toLowerCase();
  // normalizar acentos básicos
  const normalized = scaleAlias
    .replace(/menor/g, "minor")
    .replace(/mayor/g, "major")
    .replace(/pentatónica/g, "pentatonic")
    .replace(/pentatonica/g, "pentatonic");
  // probar varios mapeos: alias completo, sin pentatonic, con pentatonic, con minor/major sufijo
  const candidates = [
    normalized,
    normalized.replace(/^m/, "minor"),
    normalized.replace(/^M/, "major"),
  ];
  let key: string | undefined;
  for (const c of candidates) {
    if (SCALE_ALIASES[c]) { key = SCALE_ALIASES[c]; break; }
    if (SCALES[c]) { key = c; break; }
  }
  // si normalized es "mpentatonic" o "Mpentatonic" → pentatonicMin/Maj
  if (!key) {
    if (/^mpentatonic/.test(normalized)) key = "pentatonicMin";
    else if (/^Mpentatonic/.test(normalized)) key = "pentatonicMaj";
  }
  if (!key) throw new Error(`escala desconocida: "${input}"`);
  return { pc, scale: key, intervals: SCALES[key]! };
}

// Resuelve "1 b3 5 1' b7 4," etc. a MIDI relativo a la tónica + octava base.
// Convenciones:
//   N        → grado N (1-based)
//   bN / #N  → grado N alterado ±1 semitono
//   N'       → sube una octava (puede repetirse: 1'')
//   N,       → baja una octava
//   _        → sustain (-1)
//   . / ~    → silencio (-2)
const DEGREE_RE = /^(b{1,2}|#{1,2})?(\d+)('+|,+)?$/;

export function resolveDegrees(input: string, ref: ScaleRef, octave = 4): number[] {
  const tokens = input.trim().split(/\s+/).filter((t) => t.length > 0);
  const out: number[] = [];
  for (const t of tokens) {
    if (t === "_") { out.push(-1); continue; }
    if (t === "." || t === "~") { out.push(-2); continue; }
    const m = DEGREE_RE.exec(t);
    if (!m) throw new Error(`grado inválido: "${t}"`);
    const [, accident = "", numStr, octShift = ""] = m;
    const degree = parseInt(numStr ?? "1", 10);
    if (degree < 1) throw new Error(`grado inválido: "${t}"`);
    // grado dentro de la escala (1-based). Si excede, sube octavas.
    const len = ref.intervals.length;
    const idx = (degree - 1) % len;
    const extraOct = Math.floor((degree - 1) / len);
    let semis = ref.intervals[idx]!;
    if (accident.startsWith("b")) semis -= accident.length;
    else if (accident.startsWith("#")) semis += accident.length;
    let oct = octave + extraOct;
    if (octShift.startsWith("'")) oct += octShift.length;
    else if (octShift.startsWith(",")) oct -= octShift.length;
    const midi = (oct + 1) * 12 + ref.pc + semis;
    out.push(midi);
  }
  return out;
}

// Heurística: ¿el primer token parece grado o nota absoluta?
export function looksLikeDegrees(input: string): boolean {
  const first = input.trim().split(/\s+/)[0] ?? "";
  if (first === "_" || first === "." || first === "~") return false;
  return /^[b#]{0,2}\d/.test(first);
}
