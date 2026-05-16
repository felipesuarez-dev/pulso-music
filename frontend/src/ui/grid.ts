// Grid clickeable de N pasos sincronizada con la línea .pattern(...) bajo el cursor.
// Soporta drag-to-paint: pulsar y arrastrar enciende/apaga celdas en cadena.

import { parsePattern, patternToString } from "../dsl/pattern.ts";

export type ToggleCb = (newPatternStr: string) => boolean;

export class Grid {
  private cells: HTMLElement[] = [];
  private current: boolean[] = [];
  private dragMode: "on" | "off" | null = null;
  private dragHandled = new Set<number>();

  constructor(
    private readonly el: HTMLElement,
    private readonly hint: HTMLElement,
    private readonly label: HTMLElement,
    private readonly onToggle: ToggleCb,
  ) {
    // global pointerup termina cualquier drag
    document.addEventListener("pointerup", () => this.endDrag());
    document.addEventListener("pointercancel", () => this.endDrag());
  }

  setLabel(text: string): void {
    this.label.textContent = text;
  }

  showFromLine(line: string): void {
    const m = /\.pattern\(\s*['"]([x._\s\-]+)['"]\s*\)/.exec(line);
    if (!m) {
      this.clear();
      return;
    }
    // intenta extraer el nombre de la voz de la misma línea para el label
    this.updateLabelFromLine(line);
    try {
      const steps = parsePattern(m[1] ?? "");
      this.render(steps);
    } catch {
      this.clear();
    }
  }

  highlight(step: number): void {
    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i]!.classList.toggle("playing", i === step);
    }
  }

  private clear(): void {
    this.el.innerHTML = "";
    this.cells = [];
    this.current = [];
    this.hint.classList.remove("hidden");
    this.label.textContent = "—";
  }

  private updateLabelFromLine(line: string): void {
    const drum = /\.drum\(\s*['"]([a-z]+)['"]\s*\)/.exec(line);
    const synth = /\.synth\(\s*['"]?([a-z]+)?['"]?\s*\)/.exec(line);
    if (drum) this.label.textContent = `drum · ${drum[1]}`;
    else if (synth) this.label.textContent = `synth · ${synth[1] ?? "sine"}`;
    else this.label.textContent = "voz";
  }

  private render(steps: boolean[]): void {
    this.hint.classList.add("hidden");
    if (this.cells.length !== steps.length) {
      this.el.innerHTML = "";
      this.cells = [];
      for (let i = 0; i < steps.length; i++) {
        const c = document.createElement("div");
        c.className = "cell" + (i % 4 === 0 ? " beat" : "");
        c.dataset.step = String(i);
        c.addEventListener("pointerdown", (e) => this.startDrag(i, e));
        c.addEventListener("pointerenter", () => this.continueDrag(i));
        this.el.appendChild(c);
        this.cells.push(c);
      }
    }
    this.current = steps.slice();
    for (let i = 0; i < steps.length; i++) {
      this.cells[i]!.classList.toggle("on", steps[i]!);
    }
  }

  private startDrag(i: number, e: PointerEvent): void {
    e.preventDefault();
    if (i >= this.current.length) return;
    const wasOn = this.current[i]!;
    this.dragMode = wasOn ? "off" : "on";
    this.dragHandled.clear();
    this.applyToCell(i);
    // capture pointer para que enter funcione aunque salgas del elemento
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }

  private continueDrag(i: number): void {
    if (this.dragMode === null) return;
    this.applyToCell(i);
  }

  private endDrag(): void {
    this.dragMode = null;
    this.dragHandled.clear();
  }

  private applyToCell(i: number): void {
    if (this.dragHandled.has(i)) return;
    this.dragHandled.add(i);
    if (i >= this.current.length) return;
    const target = this.dragMode === "on";
    if (this.current[i] === target) return;
    const next = this.current.slice();
    next[i] = target;
    const str = patternToString(next);
    if (this.onToggle(str)) {
      this.current = next;
      this.cells[i]!.classList.toggle("on", target);
    }
  }
}
