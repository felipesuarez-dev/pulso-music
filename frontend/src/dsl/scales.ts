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
// Primer token = tónica (con posible sufijo m/M pegado). Resto = nombre escala.
export function parseScale(input: string): ScaleRef {
  const tokens = input.trim().split(/\s+/).filter((t) => t.length > 0);
  if (tokens.length === 0) throw new Error("escala vacía");
  const first = tokens[0]!;
  // separar tónica de posible sufijo "m"/"M" pegado: "Cm" → tónica "C", suffix "m"
  // soporta "Bbm", "F#M", "Cm", pero NO "do"/"DO" (que son tónicas válidas sin sufijo).
  const angloRe = /^([A-Ga-g][#b♯♭]?)([mM])?$/;
  const am = angloRe.exec(first);
  let rootName = first;
  let mode: "min" | "maj" | "" = "";
  if (am && am[2]) {
    rootName = am[1] ?? "";
    mode = am[2] === "m" ? "min" : "maj";
  }
  const pc = pitchClassFromName(rootName);

  // Normaliza el resto a tokens "modo" + "tipo"
  const restTokens = tokens
    .slice(1)
    .map((t) => t.toLowerCase())
    .map((t) =>
      t
        .replace(/menor/g, "minor")
        .replace(/mayor/g, "major")
        .replace(/pentatónica|pentatonica/g, "pentatonic")
        .replace(/dórico|dórica|dorica|dorico/g, "dorian")
        .replace(/mixolidio|mixolidia/g, "mixolydian")
        .replace(/frigio|frigia/g, "phrygian")
        .replace(/lidio|lidia/g, "lydian")
        .replace(/cromática|cromatica/g, "chromatic")
        .replace(/armónica|armonica/g, "harmonic")
    );

  // detecta menor/mayor en el resto si no había sufijo pegado
  if (!mode) {
    if (restTokens.includes("minor") || restTokens.includes("min") || restTokens.includes("m")) mode = "min";
    else if (restTokens.includes("major") || restTokens.includes("maj") || restTokens.includes("M".toLowerCase())) mode = "maj";
  }

  const hasPentatonic = restTokens.includes("pentatonic") || restTokens.includes("pent");
  const hasBlues = restTokens.includes("blues");
  const hasHarmonic = restTokens.includes("harmonic");
  const hasChromatic = restTokens.includes("chromatic");
  const modeName = restTokens.find((t) =>
    ["dorian", "mixolydian", "phrygian", "lydian"].includes(t)
  );

  let key: string | undefined;
  if (modeName) key = modeName;
  else if (hasChromatic) key = "chromatic";
  else if (hasBlues) key = "blues";
  else if (hasPentatonic) key = mode === "maj" ? "pentatonicMaj" : "pentatonicMin";
  else if (hasHarmonic) key = "harmonicMinor";
  else if (mode === "min") key = "minor";
  else key = "major";

  if (!SCALES[key]) throw new Error(`escala desconocida: "${input}"`);
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

// Heurística: ¿el string parece grados o notas absolutas?
// Recorre tokens saltando rests/sustains hasta encontrar uno con contenido real,
// y mira si parece grado. Esto evita el bug donde una pista que arranca con
// silencios (". . 5' 1''") era tratada como notas absolutas y crasheaba.
export function looksLikeDegrees(input: string): boolean {
  const tokens = input.trim().split(/\s+/);
  for (const t of tokens) {
    if (t === "_" || t === "." || t === "~") continue;
    return /^[b#]{0,2}\d/.test(t);
  }
  return false;
}
