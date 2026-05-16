// Encoder de Standard MIDI File (SMF), formato 1, multi-track.
// Sin librerías. Spec: https://www.midi.org/specifications/file-format-specifications/standard-midi-files

import type { SessionDef, TrackDef, VoiceDef, DrumKind } from "../types.ts";

const TICKS_PER_QUARTER = 480;
const TICKS_PER_STEP = TICKS_PER_QUARTER / 4; // 16th note
const STEPS_PER_CYCLE = 16;
const CYCLES_TO_EXPORT = 4; // exportamos 4 ciclos (= 16 beats)

export function exportSessionToMidi(session: SessionDef): Uint8Array {
  const tracks: number[][] = [];
  // Track 0: tempo + meta
  tracks.push(metaTrack(session.bpm));
  // Cada pista del DSL se convierte en una pista MIDI.
  for (const t of session.tracks) {
    tracks.push(trackToMidi(t));
  }
  return assembleSmf(tracks);
}

function metaTrack(bpm: number): number[] {
  const usPerQuarter = Math.round(60_000_000 / bpm);
  const evs: number[] = [];
  // delta 0
  pushVarLen(evs, 0);
  // FF 51 03 tt tt tt
  evs.push(0xff, 0x51, 0x03, (usPerQuarter >> 16) & 0xff, (usPerQuarter >> 8) & 0xff, usPerQuarter & 0xff);
  // delta 0 + end of track
  pushVarLen(evs, 0);
  evs.push(0xff, 0x2f, 0x00);
  return evs;
}

function trackToMidi(track: TrackDef): number[] {
  const evs: NoteEvent[] = [];
  for (let cycle = 0; cycle < CYCLES_TO_EXPORT; cycle++) {
    for (const v of track.voices) {
      const every = v.every ?? 1;
      if (every > 1 && cycle % every !== 0) continue;
      collectEvents(v, cycle, evs);
    }
  }
  evs.sort((a, b) => a.tick - b.tick || a.kind.localeCompare(b.kind));

  const out: number[] = [];
  // Track name
  pushVarLen(out, 0);
  out.push(0xff, 0x03, ...stringBytes(track.name).slice(0, 127));
  // Channel volume CC#7 + pan CC#10 (canal 0)
  pushVarLen(out, 0);
  out.push(0xb0, 0x07, Math.round(Math.min(1, track.volume) * 127));
  pushVarLen(out, 0);
  out.push(0xb0, 0x0a, Math.round(((track.pan + 1) / 2) * 127));

  let lastTick = 0;
  for (const e of evs) {
    const delta = e.tick - lastTick;
    pushVarLen(out, delta);
    if (e.kind === "on")  out.push(0x90, e.note, e.vel);
    else                  out.push(0x80, e.note, 64);
    lastTick = e.tick;
  }
  // End of track
  pushVarLen(out, 0);
  out.push(0xff, 0x2f, 0x00);
  return out;
}

interface NoteEvent { tick: number; kind: "on" | "off"; note: number; vel: number; }

function collectEvents(v: VoiceDef, cycle: number, evs: NoteEvent[]): void {
  const cycleStart = cycle * STEPS_PER_CYCLE * TICKS_PER_STEP;
  if (v.kind === "drum") {
    const note = drumNote(v.drumKind ?? "kick");
    const pat = v.pattern ?? [];
    for (let s = 0; s < pat.length; s++) {
      if (!pat[s]) continue;
      const t = cycleStart + s * TICKS_PER_STEP;
      evs.push({ tick: t, kind: "on", note, vel: 100 });
      evs.push({ tick: t + Math.floor(TICKS_PER_STEP * 0.5), kind: "off", note, vel: 0 });
    }
    return;
  }
  // synth: si hay pattern, dispara notas en cada `x`; si no, una nota por step.
  const notes = v.notes ?? [];
  if (v.pattern && v.pattern.length > 0) {
    let idx = 0;
    for (let s = 0; s < v.pattern.length; s++) {
      if (!v.pattern[s]) continue;
      const n = notes[idx % Math.max(1, notes.length)] ?? -2;
      idx++;
      if (n < 0) continue;
      const t = cycleStart + s * TICKS_PER_STEP;
      evs.push({ tick: t, kind: "on", note: n, vel: 90 });
      evs.push({ tick: t + Math.floor(TICKS_PER_STEP * 0.9), kind: "off", note: n, vel: 0 });
    }
    return;
  }
  // notes-only: cada nota dura step (-1 prolonga, -2 silencio)
  let lastNote = -1;
  let lastOnTick = -1;
  for (let s = 0; s < notes.length; s++) {
    const t = cycleStart + s * TICKS_PER_STEP;
    const n = notes[s] ?? -2;
    if (n === -1) continue; // sustain: no cierra ni abre
    // cerrar la previa
    if (lastNote >= 0) {
      evs.push({ tick: t, kind: "off", note: lastNote, vel: 0 });
      lastNote = -1;
    }
    if (n >= 0) {
      evs.push({ tick: t, kind: "on", note: n, vel: 90 });
      lastNote = n;
      lastOnTick = t;
    }
  }
  if (lastNote >= 0) {
    evs.push({ tick: cycleStart + STEPS_PER_CYCLE * TICKS_PER_STEP, kind: "off", note: lastNote, vel: 0 });
  }
  void lastOnTick;
}

function drumNote(kind: DrumKind): number {
  // General MIDI percussion (canal 10 normalmente, pero aquí lo dejamos en canal 0 para simplicidad).
  switch (kind) {
    case "kick":  return 36;
    case "snare": return 38;
    case "hat":   return 42;
    case "clap":  return 39;
  }
}

function assembleSmf(tracks: number[][]): Uint8Array {
  const header: number[] = [];
  // MThd
  header.push(0x4d, 0x54, 0x68, 0x64);
  pushUint32(header, 6);
  pushUint16(header, 1);                // formato 1
  pushUint16(header, tracks.length);    // ntrks
  pushUint16(header, TICKS_PER_QUARTER);

  const all: number[] = [...header];
  for (const tr of tracks) {
    all.push(0x4d, 0x54, 0x72, 0x6b); // MTrk
    pushUint32(all, tr.length);
    for (const b of tr) all.push(b & 0xff);
  }
  return new Uint8Array(all);
}

function pushVarLen(out: number[], n: number): void {
  let buf = n & 0x7f;
  let v = n >>> 7;
  while (v) {
    buf <<= 8;
    buf |= 0x80 | (v & 0x7f);
    v >>>= 7;
  }
  while (true) {
    out.push(buf & 0xff);
    if (buf & 0x80) buf >>= 8;
    else break;
  }
}

function pushUint16(out: number[], n: number): void {
  out.push((n >> 8) & 0xff, n & 0xff);
}
function pushUint32(out: number[], n: number): void {
  out.push((n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff);
}

function stringBytes(s: string): number[] {
  const enc = new TextEncoder().encode(s);
  return [enc.length, ...enc];
}
