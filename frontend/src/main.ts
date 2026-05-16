// Bootstrap: monta UI, conecta engine y DSL.

import { Runtime } from "./engine/runtime.ts";
import { setPlayHandler } from "./dsl/builder.ts";
import { evalUserCode } from "./dsl/eval.ts";
import { formatNote } from "./dsl/notation.ts";
import { Editor } from "./ui/editor.ts";
import { Grid } from "./ui/grid.ts";
import { Mixer } from "./ui/mixer.ts";
import { Visualizer } from "./ui/waveform.ts";
import { Transport } from "./ui/transport.ts";
import { applyI18n, getLang, setLang, t } from "./ui/i18n.ts";
import { listPatches, getPatch, savePatch, deletePatch } from "./ui/patches.ts";
import { ensureRunning, isSuspended, onStateChange } from "./engine/context.ts";
import type { Notation } from "./types.ts";

const DEFAULT_CODE = `pulso()
  .bpm(120)
  .track('drums')
    .drum('kick').pattern('x...x...x...x...')
    .drum('snare').pattern('....x.......x...')
    .drum('hat').pattern('x.x.x.x.x.x.x.x.')
  .track('bass').volume(0.7)
    .synth('sawtooth')
      .scale('Cm pent')
      .notes("1 5 b7 1' 5 4 b3 1")
      .filter(500).release(0.25)
  .track('lead').pan(0.3)
    .synth('triangle')
      .scale('Cm pent')
      .notes("1' 3' 5' 4' 3' 1' b7 5")
      .every(2).filter(2200)
  .play();
`;

const $ = <T extends HTMLElement>(sel: string): T => {
  const el = document.querySelector<T>(sel);
  if (!el) throw new Error(`elemento no encontrado: ${sel}`);
  return el;
};

const runtime = new Runtime();

const editorEl   = $<HTMLTextAreaElement>("#editor");
const errorPanel = $<HTMLPreElement>("#error-panel");
const gridEl     = $<HTMLElement>("#grid");
const gridHint   = $<HTMLElement>("#grid-hint");
const mixerEl    = $<HTMLElement>("#mixer");
const waveCanvas = $<HTMLCanvasElement>("#waveform");
const specCanvas = $<HTMLCanvasElement>("#spectrum");
const btnPlay    = $<HTMLButtonElement>("#btn-play");
const btnStop    = $<HTMLButtonElement>("#btn-stop");
const btnExport  = $<HTMLButtonElement>("#btn-export-midi");
const bpmDisplay = $<HTMLElement>("#bpm-display");
const ctxWarn    = $<HTMLElement>("#ctx-warning");
const selNotation = $<HTMLSelectElement>("#sel-notation");
const selLang    = $<HTMLSelectElement>("#sel-lang");
const btnSave    = $<HTMLButtonElement>("#btn-save");
const btnLoad    = $<HTMLButtonElement>("#btn-load");
const btnDelete  = $<HTMLButtonElement>("#btn-delete");
const selPatches = $<HTMLSelectElement>("#sel-patches");
const nowPlaying = $<HTMLOListElement>("#now-playing");

let notation: Notation = (localStorage.getItem("pulso.notation") as Notation) || "anglo";
selNotation.value = notation;
selLang.value = getLang();

// ─── i18n ──────────────────────────────────────────────────────
applyI18n();
selLang.addEventListener("change", () => setLang(selLang.value as "es" | "en"));
selNotation.addEventListener("change", () => {
  notation = selNotation.value as Notation;
  localStorage.setItem("pulso.notation", notation);
  refreshNowPlaying(0);
});

// ─── Editor ─────────────────────────────────────────────────────
const editor = new Editor(
  editorEl,
  (code) => runOnce(code),
  (line) => grid.showFromLine(line),
);
editor.setCode(DEFAULT_CODE);

// ─── Grid ──────────────────────────────────────────────────────
const grid = new Grid(gridEl, gridHint, (newPattern) => {
  const ok = editor.replacePatternOnCursorLine(newPattern);
  if (ok) runOnce(editor.getCode());
  return ok;
});

// ─── Engine setup ──────────────────────────────────────────────
setPlayHandler((session) => {
  runtime.setSession(session);
  mixer.refresh();
  transport.refreshBpm();
});

const mixer = new Mixer(mixerEl, runtime);
const visualizer = new Visualizer(waveCanvas, specCanvas);
const transport = new Transport(btnPlay, btnStop, btnExport, bpmDisplay, runtime);

visualizer.start();

// ─── Step listener para grid + nowPlaying ──────────────────────
runtime.onStep((step) => {
  grid.highlight(step);
  refreshNowPlaying(step);
});

// ─── Audio context warning ─────────────────────────────────────
function updateCtxWarn(): void {
  ctxWarn.classList.toggle("hidden", !isSuspended());
}
updateCtxWarn();
onStateChange(updateCtxWarn);

// ─── Patches ───────────────────────────────────────────────────
async function refreshPatchList(): Promise<void> {
  const list = await listPatches();
  selPatches.innerHTML = "";
  for (const p of list) {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.name;
    selPatches.appendChild(opt);
  }
}

btnSave.addEventListener("click", async () => {
  const name = prompt(t("askName"), "untitled");
  if (!name) return;
  const id = name.toLowerCase().replace(/[^a-z0-9_-]+/g, "-");
  await savePatch({ id, name, code: editor.getCode() });
  await refreshPatchList();
});

btnLoad.addEventListener("click", async () => {
  const id = selPatches.value;
  if (!id) return;
  const p = await getPatch(id);
  if (p) editor.setCode(p.code);
});

btnDelete.addEventListener("click", async () => {
  const id = selPatches.value;
  if (!id) return;
  if (!confirm(t("confirmDelete"))) return;
  await deletePatch(id);
  await refreshPatchList();
});

void refreshPatchList();

// ─── Run inicial ───────────────────────────────────────────────
function runOnce(code: string): void {
  const result = evalUserCode(code);
  if (result.ok) {
    errorPanel.classList.add("hidden");
    errorPanel.textContent = "";
  } else {
    errorPanel.classList.remove("hidden");
    errorPanel.textContent = result.error ?? "error";
  }
}

runOnce(editor.getCode());

// activar audio en cualquier interacción del usuario (necesario en iOS)
const wakeAudio = () => {
  void ensureRunning();
};
document.addEventListener("click", wakeAudio, { once: false, capture: true });
document.addEventListener("keydown", wakeAudio, { once: false, capture: true });
document.addEventListener("touchstart", wakeAudio, { once: false, capture: true, passive: true });

// ─── Now playing ───────────────────────────────────────────────
function refreshNowPlaying(currentStep: number): void {
  const session = runtime.getSession();
  if (!session) {
    nowPlaying.innerHTML = "";
    return;
  }
  // tomamos las próximas 16 entradas del primer track con notas (o de todos sumadas).
  const items: Array<{ step: number; label: string }> = [];
  for (let s = 0; s < 16; s++) {
    const labels: string[] = [];
    for (const t0 of session.tracks) {
      for (const v of t0.voices) {
        if (v.kind === "drum") {
          if (v.pattern && v.pattern[s]) labels.push((v.drumKind ?? "drum")[0]!.toUpperCase());
        } else {
          let note = -2;
          if (v.notes && v.notes.length) {
            if (v.pattern && v.pattern.length) {
              if (v.pattern[s]) {
                let idx = 0;
                for (let i = 0; i < s; i++) if (v.pattern[i]) idx++;
                note = v.notes[idx % v.notes.length] ?? -2;
              }
            } else {
              note = v.notes[s % v.notes.length] ?? -2;
            }
          }
          if (note >= 0) labels.push(formatNote(note, notation));
        }
      }
    }
    items.push({ step: s, label: labels.length ? labels.join(" ") : "·" });
  }
  nowPlaying.innerHTML = "";
  for (const it of items) {
    const li = document.createElement("li");
    li.textContent = `${it.step + 1}: ${it.label}`;
    if (it.step === currentStep) li.classList.add("active");
    nowPlaying.appendChild(li);
  }
}

refreshNowPlaying(0);
