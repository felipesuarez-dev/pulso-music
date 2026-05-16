// Vista tipo step-sequencer/tracker: filas = voces, columnas = 16 steps.
// Es de sólo lectura (la edición sigue por la grid + textarea).
// Resalta la columna actualmente reproduciéndose.

import type { Runtime } from "../engine/runtime.ts";
import { formatNote } from "../dsl/notation.ts";
import type { Notation } from "../types.ts";

const STEPS = 16;

export class Sequencer {
  private rowsEl: HTMLElement;
  private headerCells: HTMLElement[] = [];
  private currentStep = -1;

  constructor(
    private readonly el: HTMLElement,
    private readonly runtime: Runtime,
    private notation: Notation,
  ) {
    el.classList.add("sequencer");
    el.innerHTML = "";
    this.rowsEl = document.createElement("div");
    this.rowsEl.className = "seq-rows";
    el.appendChild(this.makeHeader());
    el.appendChild(this.rowsEl);
  }

  setNotation(n: Notation): void {
    this.notation = n;
    this.refresh();
  }

  refresh(): void {
    const session = this.runtime.getSession();
    this.rowsEl.innerHTML = "";
    if (!session) return;
    let tIdx = 0;
    for (const t of session.tracks) {
      for (const v of t.voices) {
        const row = this.makeRow(t.name, v);
        row.classList.add(`track-${tIdx % 6}`);
        this.rowsEl.appendChild(row);
      }
      tIdx++;
    }
  }

  highlight(step: number): void {
    if (this.currentStep === step) return;
    this.currentStep = step;
    for (let i = 0; i < this.headerCells.length; i++) {
      this.headerCells[i]!.classList.toggle("playing", i === step);
    }
    this.rowsEl.querySelectorAll<HTMLElement>(".seq-cell").forEach((c) => {
      const s = parseInt(c.dataset.step ?? "-1", 10);
      c.classList.toggle("playing", s === step);
    });
  }

  private makeHeader(): HTMLElement {
    const header = document.createElement("div");
    header.className = "seq-header";
    const label = document.createElement("div");
    label.className = "seq-label";
    label.textContent = "—";
    header.appendChild(label);
    const cells = document.createElement("div");
    cells.className = "seq-cells";
    for (let i = 0; i < STEPS; i++) {
      const c = document.createElement("div");
      c.className = "seq-num" + (i % 4 === 0 ? " beat" : "");
      c.textContent = String(i + 1);
      cells.appendChild(c);
      this.headerCells.push(c);
    }
    header.appendChild(cells);
    return header;
  }

  private makeRow(trackName: string, voice: import("../types.ts").VoiceDef): HTMLElement {
    const row = document.createElement("div");
    row.className = "seq-row";
    const label = document.createElement("div");
    label.className = "seq-label";
    const voiceName: string = voice.kind === "drum"
      ? (voice.drumKind ?? "drum")
      : (voice.wave ?? "synth");
    label.textContent = `${trackName} · ${voiceName}`;
    row.appendChild(label);

    const cells = document.createElement("div");
    cells.className = "seq-cells";

    for (let s = 0; s < STEPS; s++) {
      const c = document.createElement("div");
      c.className = "seq-cell" + (s % 4 === 0 ? " beat" : "");
      c.dataset.step = String(s);
      const trig = triggerAt(voice, s);
      if (trig.on) {
        c.classList.add("on");
        if (trig.note != null && trig.note >= 0) {
          c.textContent = formatNote(trig.note, this.notation);
          c.classList.add("with-note");
        }
      }
      cells.appendChild(c);
    }
    row.appendChild(cells);
    return row;
  }
}

function triggerAt(v: import("../types.ts").VoiceDef, step: number): { on: boolean; note?: number } {
  if (v.kind === "drum") {
    const on = !!(v.pattern && v.pattern[step]);
    return { on };
  }
  // synth
  const notes = v.notes ?? [];
  if (notes.length === 0) return { on: false };
  if (v.pattern && v.pattern.length > 0) {
    if (!v.pattern[step]) return { on: false };
    let idx = 0;
    for (let i = 0; i < step; i++) if (v.pattern[i]) idx++;
    const n = notes[idx % notes.length] ?? -2;
    return n >= 0 ? { on: true, note: n } : { on: false };
  }
  // notes-only: distribución uniforme
  const idxNow  = Math.floor((step       * notes.length) / STEPS);
  const idxPrev = step === 0 ? -1
                : Math.floor(((step - 1) * notes.length) / STEPS);
  if (idxNow === idxPrev) return { on: false };
  const n = notes[idxNow % notes.length] ?? -2;
  return n >= 0 ? { on: true, note: n } : { on: false };
}
