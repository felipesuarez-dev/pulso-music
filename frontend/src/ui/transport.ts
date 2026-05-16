// Controles de transport: play/stop toggle, BPM slider, evaluar y export MIDI.

import type { Runtime } from "../engine/runtime.ts";
import { exportSessionToMidi } from "../engine/midi.ts";
import { ensureRunning } from "../engine/context.ts";
import { t } from "./i18n.ts";

export type EvalCb = () => void;

export class Transport {
  private playing = false;
  private stateCbs = new Set<(playing: boolean) => void>();

  onStateChange(cb: (playing: boolean) => void): void {
    this.stateCbs.add(cb);
  }

  private tapTimes: number[] = [];

  constructor(
    private readonly btnPlay: HTMLButtonElement,
    private readonly btnEval: HTMLButtonElement,
    private readonly btnExport: HTMLButtonElement,
    private readonly btnTap: HTMLButtonElement,
    private readonly bpmSlider: HTMLInputElement,
    private readonly bpmDisplay: HTMLElement,
    private readonly runtime: Runtime,
    private readonly onEval: EvalCb,
  ) {
    this.btnPlay.addEventListener("click", () => this.toggle());
    this.btnEval.addEventListener("click", () => this.evaluate());
    this.btnExport.addEventListener("click", () => this.exportMidi());
    this.btnTap.addEventListener("click", () => this.tap());
    this.bpmSlider.addEventListener("input", () => this.onBpmSlide());
  }

  refreshBpm(): void {
    const s = this.runtime.getSession();
    if (!s) return;
    this.bpmDisplay.textContent = String(s.bpm);
    this.bpmSlider.value = String(s.bpm);
  }

  toggle(): void {
    if (this.playing) this.stop();
    else void this.play();
  }

  isPlaying(): boolean { return this.playing; }

  private async play(): Promise<void> {
    await ensureRunning();
    this.runtime.play();
    this.playing = true;
    this.btnPlay.classList.add("active");
    this.swapIcon(true);
    this.stateCbs.forEach((cb) => cb(true));
  }

  private stop(): void {
    this.runtime.stop();
    this.playing = false;
    this.btnPlay.classList.remove("active");
    this.swapIcon(false);
    this.stateCbs.forEach((cb) => cb(false));
  }

  private swapIcon(playing: boolean): void {
    const iconPlay = document.getElementById("icon-play");
    const iconStop = document.getElementById("icon-stop");
    if (iconPlay) iconPlay.classList.toggle("hidden", playing);
    if (iconStop) iconStop.classList.toggle("hidden", !playing);
    this.btnPlay.setAttribute("title", playing
      ? t("stop") + " (espacio)"
      : t("play") + " (espacio)");
  }

  // Llamable desde fuera para forzar pausa (p. ej. al detectar error de código).
  pauseIfPlaying(): void {
    if (this.playing) this.stop();
  }

  private evaluate(): void {
    this.onEval();
    // pequeño flash visual al evaluar
    this.btnEval.classList.add("flash");
    setTimeout(() => this.btnEval.classList.remove("flash"), 200);
  }

  private onBpmSlide(): void {
    const bpm = parseInt(this.bpmSlider.value, 10);
    this.bpmDisplay.textContent = String(bpm);
    this.runtime.setBpm(bpm);
  }

  private tap(): void {
    const now = performance.now();
    // descartar taps muy lejanos (>2s) — empezar de cero
    if (this.tapTimes.length && now - (this.tapTimes.at(-1) ?? 0) > 2000) {
      this.tapTimes = [];
    }
    this.tapTimes.push(now);
    if (this.tapTimes.length > 6) this.tapTimes.shift();
    if (this.tapTimes.length < 2) return;
    const intervals: number[] = [];
    for (let i = 1; i < this.tapTimes.length; i++) {
      intervals.push(this.tapTimes[i]! - this.tapTimes[i - 1]!);
    }
    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const bpm = Math.round(60000 / avg);
    const clamped = Math.max(40, Math.min(220, bpm));
    this.bpmSlider.value = String(clamped);
    this.bpmDisplay.textContent = String(clamped);
    this.runtime.setBpm(clamped);
  }

  private exportMidi(): void {
    const s = this.runtime.getSession();
    if (!s) return;
    const bytes = exportSessionToMidi(s);
    const blob = new Blob([bytes], { type: "audio/midi" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pulso.mid";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
