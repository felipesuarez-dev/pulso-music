// Renderiza waveform (time domain) y espectro (frequency domain) del bus master.

import { getMaster } from "../engine/master.ts";

export class Visualizer {
  private rafId = 0;
  private timeBuf: Uint8Array;
  private freqBuf: Uint8Array;
  private lastDrawAt = 0;
  private readonly minFrameMs = 33; // throttle a ~30fps

  constructor(
    private readonly waveCanvas: HTMLCanvasElement,
    private readonly specCanvas: HTMLCanvasElement,
  ) {
    const a = getMaster().analyser;
    this.timeBuf = new Uint8Array(a.fftSize);
    this.freqBuf = new Uint8Array(a.frequencyBinCount);
    this.fitCanvas(this.waveCanvas);
    this.fitCanvas(this.specCanvas);
    window.addEventListener("resize", () => {
      this.fitCanvas(this.waveCanvas);
      this.fitCanvas(this.specCanvas);
    });
  }

  start(): void {
    if (this.rafId) return;
    const draw = (now: number) => {
      this.rafId = requestAnimationFrame(draw);
      if (now - this.lastDrawAt < this.minFrameMs) return;
      this.lastDrawAt = now;
      this.tick();
    };
    this.rafId = requestAnimationFrame(draw);
  }

  stop(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  private tick(): void {
    const a = getMaster().analyser;
    a.getByteTimeDomainData(this.timeBuf);
    a.getByteFrequencyData(this.freqBuf);
    this.drawWave();
    this.drawSpectrum();
  }

  private drawWave(): void {
    const c = this.waveCanvas;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#65d6ff";
    ctx.beginPath();
    const sliceW = c.width / this.timeBuf.length;
    for (let i = 0; i < this.timeBuf.length; i++) {
      const v = this.timeBuf[i]! / 128;
      const y = (v * c.height) / 2;
      if (i === 0) ctx.moveTo(i * sliceW, y);
      else ctx.lineTo(i * sliceW, y);
    }
    ctx.stroke();
  }

  private drawSpectrum(): void {
    const c = this.specCanvas;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);
    const bars = 64;
    const step = Math.floor(this.freqBuf.length / bars);
    const w = c.width / bars;
    for (let i = 0; i < bars; i++) {
      let sum = 0;
      for (let j = 0; j < step; j++) sum += this.freqBuf[i * step + j] ?? 0;
      const v = sum / step / 255;
      const h = v * c.height;
      const grad = ctx.createLinearGradient(0, c.height, 0, 0);
      grad.addColorStop(0, "#ffb454");
      grad.addColorStop(1, "#ff6b6b");
      ctx.fillStyle = grad;
      ctx.fillRect(i * w + 1, c.height - h, w - 2, h);
    }
  }

  private fitCanvas(c: HTMLCanvasElement): void {
    const dpr = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = Math.max(200, Math.floor(rect.width * dpr));
    c.height = Math.max(40, Math.floor(rect.height * dpr));
  }
}
