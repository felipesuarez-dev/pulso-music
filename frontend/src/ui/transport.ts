// Controles de play/stop, BPM display y export MIDI.

import type { Runtime } from "../engine/runtime.ts";
import { exportSessionToMidi } from "../engine/midi.ts";
import { ensureRunning } from "../engine/context.ts";

export class Transport {
  constructor(
    private readonly btnPlay: HTMLButtonElement,
    private readonly btnStop: HTMLButtonElement,
    private readonly btnExport: HTMLButtonElement,
    private readonly bpmDisplay: HTMLElement,
    private readonly runtime: Runtime,
  ) {
    this.btnPlay.addEventListener("click", () => this.play());
    this.btnStop.addEventListener("click", () => this.stop());
    this.btnExport.addEventListener("click", () => this.exportMidi());
  }

  refreshBpm(): void {
    const s = this.runtime.getSession();
    if (s) this.bpmDisplay.textContent = String(s.bpm);
  }

  private async play(): Promise<void> {
    await ensureRunning();
    this.runtime.play();
  }

  private stop(): void {
    this.runtime.stop();
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
