// Bootstrap: monta UI, conecta engine y DSL.
// Encapsulado en try/catch para que cualquier error fatal sea visible al usuario,
// no silencioso en la consola.

import { Runtime } from "./engine/runtime.ts";
import { setPlayHandler } from "./dsl/builder.ts";
import { evalUserCode } from "./dsl/eval.ts";
import { lintCode, type Lint } from "./dsl/lint.ts";
import { Editor } from "./ui/editor.ts";
import { Grid } from "./ui/grid.ts";
import { Mixer } from "./ui/mixer.ts";
import { Sequencer } from "./ui/sequencer.ts";
import { Visualizer } from "./ui/waveform.ts";
import { Transport } from "./ui/transport.ts";
import { applyI18n, getLang, setLang } from "./ui/i18n.ts";
import { listPatches, getPatch, savePatch, deletePatch } from "./ui/patches.ts";
import { ensureRunning, isSuspended, onStateChange } from "./engine/context.ts";
import { setMasterVolume } from "./engine/master.ts";
import { EXAMPLES } from "./ui/examples.ts";
import type { Notation } from "./types.ts";

try {
  bootstrap();
} catch (e) {
  showBootError(e);
}

function showBootError(e: unknown): void {
  const el = document.getElementById("boot-error");
  const msg = e instanceof Error ? `${e.name}: ${e.message}\n\n${e.stack ?? ""}` : String(e);
  if (el) {
    el.textContent = "🔴 Error fatal en bootstrap:\n\n" + msg;
    el.classList.remove("hidden");
  }
  console.error("[pulso] bootstrap failed:", e);
}

function bootstrap(): void {
  const $ = <T extends HTMLElement>(sel: string): T => {
    const el = document.querySelector<T>(sel);
    if (!el) throw new Error(`elemento del DOM no encontrado: ${sel}`);
    return el;
  };

  // Default code: el primer ejemplo (multi-pista para que se oiga "música").
  const DEFAULT_CODE = EXAMPLES[0]!.code;

  const runtime = new Runtime();

  const editorEl   = $<HTMLTextAreaElement>("#editor");
  const gutterEl   = $<HTMLElement>("#gutter");
  const consoleLog = $<HTMLOListElement>("#console-log");
  const consoleStatus = $<HTMLElement>("#console-status");
  const btnConsoleClear = $<HTMLButtonElement>("#btn-console-clear");
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
  const btnMetronome = $<HTMLButtonElement>("#btn-metronome");
  const bpmSlider  = $<HTMLInputElement>("#bpm-slider");
  const bpmDisplay = $<HTMLElement>("#bpm-display");
  const volSlider  = $<HTMLInputElement>("#vol-slider");
  const volDisplay = $<HTMLElement>("#vol-display");
  const ctxWarn    = $<HTMLElement>("#ctx-warning");
  const stepText   = $<HTMLElement>("#step-text");
  const stepIndicator = $<HTMLElement>("#step-indicator");
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

  // ─── ORDEN CRÍTICO ─────────────────────────────────────────────
  // Primero todos los componentes (sin disparar callbacks).
  // Después conexiones y por último editor.setCode + runOnce.
  // ───────────────────────────────────────────────────────────────

  // Renderiza un mensaje en la consola; click en el item jumpea a la línea.
  function appendConsole(severity: "error" | "warn" | "ok" | "info", line: number | undefined, msg: string): void {
    const li = document.createElement("li");
    li.className = `entry ${severity}`;
    const icon = severity === "error" ? "🔴" : severity === "warn" ? "🟡" : severity === "ok" ? "✓" : "›";
    const lineTag = line != null
      ? `<span class="ln" title="ir a línea ${line}">L${line}</span> `
      : "";
    li.innerHTML = `<span class="icon">${icon}</span> ${lineTag}<span class="msg"></span>`;
    li.querySelector(".msg")!.textContent = msg;
    if (line != null) li.addEventListener("click", () => editor.jumpToLine(line));
    consoleLog.appendChild(li);
    consoleLog.scrollTop = consoleLog.scrollHeight;
  }

  function clearConsole(): void {
    consoleLog.innerHTML = "";
  }

  function setStatus(ok: boolean, errors: number, warns: number): void {
    if (ok && errors === 0 && warns === 0) {
      consoleStatus.className = "ok";
      consoleStatus.textContent = "✓ Sin errores";
    } else if (errors > 0) {
      consoleStatus.className = "err";
      consoleStatus.textContent = `🔴 ${errors} error${errors === 1 ? "" : "es"}` + (warns > 0 ? ` · 🟡 ${warns} advertencia${warns === 1 ? "" : "s"}` : "");
    } else {
      consoleStatus.className = "warn";
      consoleStatus.textContent = `🟡 ${warns} advertencia${warns === 1 ? "" : "s"}`;
    }
  }

  btnConsoleClear.addEventListener("click", () => {
    clearConsole();
    setStatus(true, 0, 0);
  });

  function runOnce(code: string): void {
    clearConsole();
    // 1. linter primero (estático)
    const lints = lintCode(code);
    const lintErrors = lints.filter((l) => l.severity === "error");
    const lintWarns  = lints.filter((l) => l.severity === "warn");
    for (const l of lints) {
      appendConsole(l.severity === "warn" ? "warn" : "error", l.line, l.message);
    }
    // 2. eval — si hay errores de linter, NO ejecutamos para no romper la sesión
    if (lintErrors.length > 0) {
      const errLines = new Set(lints.filter((l) => l.severity === "error").map((l) => l.line));
      editor.setErrorLines(errLines);
      setStatus(false, lintErrors.length, lintWarns.length);
      return;
    }
    const result = evalUserCode(code);
    if (result.ok) {
      editor.setErrorLines(new Set());
      if (lintWarns.length === 0) {
        appendConsole("ok", undefined, "código evaluado correctamente");
      }
      setStatus(true, 0, lintWarns.length);
    } else {
      appendConsole("error", result.line, result.error ?? "error");
      editor.setErrorLines(result.line != null ? new Set([result.line]) : new Set());
      setStatus(false, 1, lintWarns.length);
    }
  }

  // 1. Grid (su callback referencia editor en closure → safe; no se invoca aún)
  const grid = new Grid(gridEl, gridHint, gridLabel, (newPattern) => {
    const ok = editor.replacePatternOnCursorLine(newPattern);
    if (ok) runOnce(editor.getCode());
    return ok;
  });

  // 2. Editor — sus callbacks referencian grid (ya creado) y runOnce (declarada)
  const editor = new Editor(
    editorEl,
    (code) => runOnce(code),
    (line) => grid.showFromLine(line),
    gutterEl,
  );

  // Linter en vivo (debounced) — corre sin evaluar; sólo pinta marcas y consola
  let lintTimer: number | undefined;
  editor.onInput((code) => {
    if (lintTimer) clearTimeout(lintTimer);
    lintTimer = window.setTimeout(() => {
      const lints = lintCode(code);
      const errLines = new Set<number>();
      let errs = 0, warns = 0;
      // refrescamos sólo si NO acabamos de evaluar (el último log de runOnce gana)
      // → estrategia simple: pintamos warning/error count en status; gutter siempre actualizado
      for (const l of lints) {
        if (l.severity === "error") { errs++; errLines.add(l.line); }
        else if (l.severity === "warn") warns++;
      }
      editor.setErrorLines(errLines);
      // si la consola está vacía, mostrar el lint en vivo
      if (consoleLog.children.length === 0) {
        for (const l of lints) {
          appendConsole(l.severity === "warn" ? "warn" : "error", l.line, l.message);
        }
        setStatus(errs === 0, errs, warns);
      }
    }, 250);
  });

  // 3. Mixer/Sequencer/Visualizer/Transport
  const mixer = new Mixer(mixerEl, runtime);
  const sequencer = new Sequencer(sequencerEl, runtime, notation);
  const visualizer = new Visualizer(waveCanvas, specCanvas);
  const transport = new Transport(
    btnPlay, btnEval, btnExport, btnTap, bpmSlider, bpmDisplay, runtime,
    () => runOnce(editor.getCode()),
  );

  visualizer.start();

  // 4. Cablear handlers que dependen de los componentes
  setPlayHandler((session) => {
    runtime.setSession(session);
    mixer.refresh();
    sequencer.refresh();
    transport.refreshBpm();
  });

  runtime.onStep((step, cycle) => {
    grid.highlight(step);
    sequencer.highlight(step);
    stepText.textContent = `${step + 1}/16 · ciclo ${cycle + 1}`;
    stepIndicator.classList.add("active");
  });

  // i18n + listeners
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

  // Ejemplos
  selExamples.innerHTML = "";
  {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "— elige un ejemplo —";
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
    // queda seleccionado en el combo para que veas qué ejemplo cargaste.
  });

  // Master volume — persiste en localStorage
  {
    const stored = parseFloat(localStorage.getItem("pulso.masterVolume") ?? "0.85");
    const initial = isNaN(stored) ? 0.85 : Math.max(0, Math.min(1.5, stored));
    setMasterVolume(initial);
    volSlider.value = String(Math.round(initial * 100));
    volDisplay.textContent = `${Math.round(initial * 100)}%`;
  }
  volSlider.addEventListener("input", () => {
    const pct = parseInt(volSlider.value, 10);
    const v = pct / 100;
    setMasterVolume(v);
    volDisplay.textContent = `${pct}%`;
    localStorage.setItem("pulso.masterVolume", String(v));
  });

  // Metrónomo
  {
    const stored = localStorage.getItem("pulso.metronome") === "1";
    runtime.metronome.setEnabled(stored);
    btnMetronome.classList.toggle("on", stored);
    btnMetronome.setAttribute("aria-pressed", String(stored));
  }
  btnMetronome.addEventListener("click", () => {
    const next = !runtime.metronome.isEnabled();
    runtime.metronome.setEnabled(next);
    btnMetronome.classList.toggle("on", next);
    btnMetronome.setAttribute("aria-pressed", String(next));
    localStorage.setItem("pulso.metronome", next ? "1" : "0");
  });

  // Audio context warning
  function updateCtxWarn(): void {
    ctxWarn.classList.toggle("hidden", !isSuspended());
  }
  updateCtxWarn();
  onStateChange(updateCtxWarn);

  // Patches
  async function refreshPatchList(): Promise<void> {
    const list = await listPatches();
    selPatches.innerHTML = "";
    if (list.length === 0) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "— sin patches —";
      selPatches.appendChild(opt);
      return;
    }
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

  // 5. AHORA SÍ: cargar el código por defecto. Todos los componentes existen.
  editor.setCode(DEFAULT_CODE);
  runOnce(editor.getCode());
  positionCursorOnPattern();

  // Activar audio en cualquier interacción del usuario (iOS/Chrome móvil)
  const wakeAudio = () => { void ensureRunning(); };
  document.addEventListener("click", wakeAudio, { capture: true });
  document.addEventListener("keydown", wakeAudio, { capture: true });
  document.addEventListener("touchstart", wakeAudio, { capture: true, passive: true });

  // Atajo: barra espaciadora = play/stop
  document.addEventListener("keydown", (e) => {
    if (e.key !== " " && e.code !== "Space") return;
    const tgt = e.target as HTMLElement;
    if (tgt && (tgt.tagName === "TEXTAREA" || tgt.tagName === "INPUT" || tgt.tagName === "SELECT")) return;
    e.preventDefault();
    transport.toggle();
  });

  console.log("[pulso] bootstrap OK");
}
