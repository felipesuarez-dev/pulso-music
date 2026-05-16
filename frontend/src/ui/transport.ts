// Controles de transport: play/stop toggle, BPM slider, evaluar y export MIDI.

import type { Runtime } from "../engine/runtime.ts";
import { exportSessionToMidi } from "../engine/midi.ts";
import { ensureRunning } from "../engine/context.ts";
import { t } from "./i18n.ts";

export type EvalCb = () => void;

export class Transport {
  private playing = false;

  constructor(
    private readonly btnPlay: HTMLButtonElement,
    private readonly btnEval: HTMLButtonElement,
    private readonly btnExport: HTMLButtonElement,
    private readonly bpmSlider: HTMLInputElement,
    private readonly bpmDisplay: HTMLElement,
    private readonly runtime: Runtime,
    private readonly onEval: EvalCb,
  ) {
    this.btnPlay.addEventListener("click", () => this.toggle());
    this.btnEval.addEventListener("click", () => this.evaluate());
    this.btnExport.addEventListener("click", () => this.exportMidi());
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
    this.btnPlay.textContent = t("stop");
    this.btnPlay.classList.add("active");
  }

  private stop(): void {
    this.runtime.stop();
    this.playing = false;
    this.btnPlay.textContent = t("play");
    this.btnPlay.classList.remove("active");
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
