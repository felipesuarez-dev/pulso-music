// Grid clickeable de N pasos sincronizada con la línea .pattern(...) bajo el cursor.

import { parsePattern, patternToString } from "../dsl/pattern.ts";

export type ToggleCb = (newPatternStr: string) => boolean;

export class Grid {
  private cells: HTMLElement[] = [];
  private current: boolean[] = [];

  constructor(
    private readonly el: HTMLElement,
    private readonly hint: HTMLElement,
    private readonly onToggle: ToggleCb,
  ) {}

  showFromLine(line: string): void {
    const m = /\.pattern\(\s*['"]([x._\s\-]+)['"]\s*\)/.exec(line);
    if (!m) {
      this.clear();
      return;
    }
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
  }

  private render(steps: boolean[]): void {
    this.hint.classList.add("hidden");
    if (this.cells.length !== steps.length) {
      this.el.innerHTML = "";
      this.cells = [];
      for (let i = 0; i < steps.length; i++) {
        const c = document.createElement("div");
        c.className = "cell" + (i % 4 === 0 ? " beat" : "");
        c.addEventListener("click", () => this.toggle(i));
        this.el.appendChild(c);
        this.cells.push(c);
      }
    }
    this.current = steps.slice();
    for (let i = 0; i < steps.length; i++) {
      this.cells[i]!.classList.toggle("on", steps[i]!);
    }
  }

  private toggle(i: number): void {
    if (i >= this.current.length) return;
    const next = this.current.slice();
    next[i] = !next[i];
    const str = patternToString(next);
    if (this.onToggle(str)) {
      this.current = next;
      this.cells[i]!.classList.toggle("on", next[i]!);
    }
  }
}
