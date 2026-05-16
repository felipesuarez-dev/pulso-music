// Parser/formatter de nombres de nota bilingüe (anglo + latina/solfeo).
// Representación canónica: número MIDI entero (60 = C4 = DO4).
//
// Soporta:
//   c4 / C4 / do4 / DO4
//   c#4 / C#4 / do#4 / DO♯4
//   db4 / Db4 / reb4 / RE♭4
//   sin octava: c → c4
//   tokens especiales: '_' = sustain (-1), '.' / '~' = rest (-2)

import type { Notation } from "../types.ts";

const NAME_TO_PC: Record<string, number> = {
  // anglo
  c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11,
  // latina / solfeo
  do: 0, re: 2, mi: 4, fa: 5, sol: 7, la: 9, si: 11,
};

const PC_TO_ANGLO: readonly string[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const PC_TO_LATINA: readonly string[] = ["DO", "DO#", "RE", "RE#", "MI", "FA", "FA#", "SOL", "SOL#", "LA", "LA#", "SI"];

export const SUSTAIN = -1;
export const REST = -2;

const TOKEN_RE = /^(do|re|mi|fa|sol|la|si|[a-g])([#b♯♭]?)(-?\d+)?$/i;

export function parseNote(token: string): number {
  const t = token.trim();
  if (t === "_") return SUSTAIN;
  if (t === "." || t === "~") return REST;
  const m = TOKEN_RE.exec(t);
  if (!m) throw new Error(`nota inválida: "${token}"`);
  const [, name, accident = "", oct] = m;
  const pcKey = (name ?? "").toLowerCase();
  const pcBase = NAME_TO_PC[pcKey];
  if (pcBase === undefined) throw new Error(`nota inválida: "${token}"`);
  let pc = pcBase;
  if (accident === "#" || accident === "♯") pc += 1;
  else if (accident === "b" || accident === "♭") pc -= 1;
  pc = (pc + 12) % 12;
  const octave = oct !== undefined ? parseInt(oct, 10) : 4;
  return (octave + 1) * 12 + pc; // MIDI: C-1 = 0
}

export function parseNotes(input: string): number[] {
  return input
    .trim()
    .split(/\s+/)
    .filter((s) => s.length > 0)
    .map(parseNote);
}

export function formatNote(midi: number, lang: Notation = "anglo"): string {
  if (midi === SUSTAIN) return "_";
  if (midi === REST) return ".";
  const pc = ((midi % 12) + 12) % 12;
  const oct = Math.floor(midi / 12) - 1;
  const table = lang === "anglo" ? PC_TO_ANGLO : PC_TO_LATINA;
  return `${table[pc]}${oct}`;
}

export function pitchClassFromName(name: string): number {
  const t = name.trim().toLowerCase();
  const m = /^(do|re|mi|fa|sol|la|si|[a-g])([#b♯♭]?)$/.exec(t);
  if (!m) throw new Error(`tónica inválida: "${name}"`);
  const [, base, accident = ""] = m;
  let pc = NAME_TO_PC[base ?? ""];
  if (pc === undefined) throw new Error(`tónica inválida: "${name}"`);
  if (accident === "#" || accident === "♯") pc += 1;
  else if (accident === "b" || accident === "♭") pc -= 1;
  return (pc + 12) % 12;
}
