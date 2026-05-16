// Bootstrap: monta UI, conecta engine y DSL.

import { Runtime } from "./engine/runtime.ts";
import { setPlayHandler } from "./dsl/builder.ts";
import { evalUserCode } from "./dsl/eval.ts";
import { Editor } from "./ui/editor.ts";
import { Grid } from "./ui/grid.ts";
import { Mixer } from "./ui/mixer.ts";
import { Sequencer } from "./ui/sequencer.ts";
import { Visualizer } from "./ui/waveform.ts";
import { Transport } from "./ui/transport.ts";
import { applyI18n, getLang, setLang } from "./ui/i18n.ts";
import { listPatches, getPatch, savePatch, deletePatch } from "./ui/patches.ts";
import { ensureRunning, isSuspended, onStateChange } from "./engine/context.ts";
import { EXAMPLES } from "./ui/examples.ts";
import type { Notation } from "./types.ts";

// Default code: lo más simple posible — kick + snare. El user puede cargar
// otros ejemplos del dropdown o escribir lo suyo.
const DEFAULT_CODE = EXAMPLES[0]!.code;

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
const gridLabel  = $<HTMLElement>("#grid-label");
const sequencerEl = $<HTMLElement>("#sequencer");
const mixerEl    = $<HTMLElement>("#mixer");
const waveCanvas = $<HTMLCanvasElement>("#waveform");
const specCanvas = $<HTMLCanvasElement>("#spectrum");
const btnPlay    = $<HTMLButtonElement>("#btn-play");
const btnEval    = $<HTMLButtonElement>("#btn-eval");
const btnExport  = $<HTMLButtonElement>("#btn-export-midi");
const btnTap     = $<HTMLButtonElement>("#btn-tap");
const bpmSlider  = $<HTMLInputElement>("#bpm-slider");
const bpmDisplay = $<HTMLElement>("#bpm-display");
const ctxWarn    = $<HTMLElement>("#ctx-warning");
const selExamples = $<HTMLSelectElement>("#sel-examples");
const selNotation = $<HTMLSelectElement>("#sel-notation");
const selLang    = $<HTMLSelectElement>("#sel-lang");
const btnSave    = $<HTMLButtonElement>("#btn-save");
const btnLoad    = $<HTMLButtonElement>("#btn-load");
const btnDelete  = $<HTMLButtonElement>("#btn-delete");
const selPatches = $<HTMLSelectElement>("#sel-patches");

let notation: Notation = (localStorage.getItem("pulso.notation") as Notation) || "anglo";
selNotation.value = notation;
selLang.value = getLang();

// ─── i18n ──────────────────────────────────────────────────────
applyI18n();
selLang.addEventListener("change", () => {
  setLang(selLang.value as "es" | "en");
  applyI18n();
});
selNotation.addEventListener("change", () => {
  notation = selNotation.value as Notation;
  localStorage.setItem("pulso.notation", notation);
  sequencer.setNotation(notation);
});

// ─── Examples dropdown ────────────────────────────────────────
selExamples.innerHTML = "";
{
  const opt = document.createElement("option");
  opt.value = "";
  opt.textContent = "—";
  selExamples.appendChild(opt);
}
for (const ex of EXAMPLES) {
  const opt = document.createElement("option");
  opt.value = ex.id;
  opt.textContent = ex.name;
  selExamples.appendChild(opt);
}
selExamples.addEventListener("change", () => {
  const id = selExamples.value;
  if (!id) return;
  const ex = EXAMPLES.find((e) => e.id === id);
  if (!ex) return;
  editor.setCode(ex.code);
  runOnce(ex.code);
  positionCursorOnPattern();
  selExamples.value = "";
});

// ─── Editor ─────────────────────────────────────────────────────
const editor = new Editor(
  editorEl,
  (code) => runOnce(code),
  (line) => grid.showFromLine(line),
);
editor.setCode(DEFAULT_CODE);

// ─── Grid ──────────────────────────────────────────────────────
const grid = new Grid(gridEl, gridHint, gridLabel, (newPattern) => {
  const ok = editor.replacePatternOnCursorLine(newPattern);
  if (ok) runOnce(editor.getCode());
  return ok;
});

// ─── Engine setup ──────────────────────────────────────────────
setPlayHandler((session) => {
  runtime.setSession(session);
  mixer.refresh();
  sequencer.refresh();
  transport.refreshBpm();
});

const mixer = new Mixer(mixerEl, runtime);
const sequencer = new Sequencer(sequencerEl, runtime, notation);
const visualizer = new Visualizer(waveCanvas, specCanvas);
const transport = new Transport(
  btnPlay, btnEval, btnExport, btnTap, bpmSlider, bpmDisplay, runtime,
  () => runOnce(editor.getCode()),
);

visualizer.start();

// ─── Step listener para grid + sequencer ───────────────────────
runtime.onStep((step) => {
  grid.highlight(step);
  sequencer.highlight(step);
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
  const name = prompt("Nombre del patch:", "untitled");
  if (!name) return;
  const id = name.toLowerCase().replace(/[^a-z0-9_-]+/g, "-");
  await savePatch({ id, name, code: editor.getCode() });
  await refreshPatchList();
});

btnLoad.addEventListener("click", async () => {
  const id = selPatches.value;
  if (!id) return;
  const p = await getPatch(id);
  if (p) { editor.setCode(p.code); runOnce(p.code); positionCursorOnPattern(); }
});

btnDelete.addEventListener("click", async () => {
  const id = selPatches.value;
  if (!id) return;
  if (!confirm("¿Borrar este patch?")) return;
  await deletePatch(id);
  await refreshPatchList();
});

void refreshPatchList();

// ─── Eval & cursor helpers ─────────────────────────────────────
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

function positionCursorOnPattern(): void {
  const lines = editor.getCode().split("\n");
  let pos = 0;
  for (const ln of lines) {
    if (/\.pattern\(/.test(ln)) {
      editorEl.focus();
      editorEl.selectionStart = editorEl.selectionEnd = pos + ln.indexOf(".pattern");
      editorEl.dispatchEvent(new Event("input"));
      editorEl.blur();
      return;
    }
    pos += ln.length + 1;
  }
}

runOnce(editor.getCode());
positionCursorOnPattern();

// ─── Activar audio en cualquier interacción del usuario (iOS) ──
const wakeAudio = () => { void ensureRunning(); };
document.addEventListener("click", wakeAudio, { capture: true });
document.addEventListener("keydown", wakeAudio, { capture: true });
document.addEventListener("touchstart", wakeAudio, { capture: true, passive: true });

// ─── Atajo: barra espaciadora = play/stop ──────────────────────
document.addEventListener("keydown", (e) => {
  if (e.key !== " " && e.code !== "Space") return;
  const tgt = e.target as HTMLElement;
  if (tgt && (tgt.tagName === "TEXTAREA" || tgt.tagName === "INPUT" || tgt.tagName === "SELECT")) return;
  e.preventDefault();
  transport.toggle();
});
