// Wrapper simple sobre <textarea>. Atajos:
//   Ctrl+Enter / Cmd+Enter → evalúa
//   Tab → inserta dos espacios
// Emite evento de "línea bajo el cursor" para que la grid sepa qué patrón mostrar.
// Sincroniza el scroll del <pre id="gutter"> con el del textarea para que los
// números de línea sigan al contenido.

export type EvalCb = (code: string) => void;
export type CursorLineCb = (line: string, lineStart: number, lineEnd: number) => void;
export type InputCb = (code: string) => void;

export class Editor {
  private inputCbs = new Set<InputCb>();
  private playingLines = new Set<number>();

  constructor(
    private readonly el: HTMLTextAreaElement,
    private readonly onEval: EvalCb,
    private readonly onCursorLine: CursorLineCb,
    private readonly gutter?: HTMLElement,
    private readonly overlay?: HTMLElement,
  ) {
    this.el.addEventListener("keydown", (e) => this.onKey(e));
    const emit = () => this.emitCursor();
    this.el.addEventListener("click", emit);
    this.el.addEventListener("keyup", emit);
    this.el.addEventListener("input", () => {
      this.renderGutter();
      emit();
      const v = this.el.value;
      this.inputCbs.forEach((cb) => cb(v));
    });
    this.el.addEventListener("scroll", () => this.syncScroll());
  }

  onInput(cb: InputCb): void { this.inputCbs.add(cb); }

  getLineCount(): number { return this.el.value.split("\n").length; }

  // Salta al inicio de una línea (1-indexed) y devuelve foco al editor.
  jumpToLine(line: number): void {
    const lines = this.el.value.split("\n");
    const idx = Math.max(1, Math.min(lines.length, line)) - 1;
    let pos = 0;
    for (let i = 0; i < idx; i++) pos += (lines[i]?.length ?? 0) + 1;
    this.el.focus();
    this.el.selectionStart = this.el.selectionEnd = pos;
    // intenta scrollear la línea al centro
    const lineHeight = parseFloat(getComputedStyle(this.el).lineHeight || "20");
    this.el.scrollTop = Math.max(0, lineHeight * (idx - 3));
    this.syncScroll();
    this.emitCursor();
  }

  // Pinta el gutter con los números de línea + opcionalmente marca líneas con error.
  setErrorLines(lines: Set<number>): void {
    this.errorLines = lines;
    this.renderGutter();
  }

  // Marca las líneas que están "disparando" música ahora mismo.
  // Se llama desde el runtime.onStep en main.ts.
  setPlayingLines(lines: Set<number>): void {
    this.playingLines = lines;
    this.renderOverlay();
    this.renderGutter();
  }

  private errorLines = new Set<number>();

  private renderGutter(): void {
    if (!this.gutter) return;
    const total = this.getLineCount();
    let html = "";
    for (let i = 1; i <= total; i++) {
      if (this.errorLines.has(i))       html += `<span class="err">${i}</span>\n`;
      else if (this.playingLines.has(i)) html += `<span class="playing">${i}</span>\n`;
      else                               html += `${i}\n`;
    }
    this.gutter.innerHTML = html;
    this.syncScroll();
  }

  private renderOverlay(): void {
    if (!this.overlay) return;
    this.overlay.innerHTML = "";
    if (this.playingLines.size === 0) return;
    const cs = getComputedStyle(this.el);
    const lineHeight = parseFloat(cs.lineHeight || "22");
    const padTop = parseFloat(cs.paddingTop || "16");
    for (const ln of this.playingLines) {
      const div = document.createElement("div");
      div.className = "line-hl";
      const top = padTop + (ln - 1) * lineHeight - this.el.scrollTop;
      div.style.top = `${top}px`;
      div.style.height = `${lineHeight}px`;
      this.overlay.appendChild(div);
    }
  }

  private syncScroll(): void {
    if (this.gutter) this.gutter.scrollTop = this.el.scrollTop;
    this.renderOverlay();
  }

  setCode(code: string): void {
    this.el.value = code;
    this.renderGutter();
    this.emitCursor();
  }

  getCode(): string { return this.el.value; }

  // reemplaza el patrón en la línea bajo el cursor.
  // Asume longitud invariante.
  replacePatternOnCursorLine(newPattern: string): boolean {
    const { selectionStart } = this.el;
    const text = this.el.value;
    const { lineStart, lineEnd } = lineRangeAt(text, selectionStart);
    const line = text.slice(lineStart, lineEnd);
    const re = /(\.pattern\(\s*['"])([x._\s\-]+)(['"]\s*\))/;
    const m = re.exec(line);
    if (!m) return false;
    const matchStartInLine = m.index;
    const before = m[1] ?? "";
    const after = m[3] ?? "";
    const newLine = line.slice(0, matchStartInLine) + before + newPattern + after + line.slice(matchStartInLine + m[0].length);
    if (newLine.length !== line.length) {
      // longitudes deberían matchear porque pattern tiene misma longitud
    }
    this.el.value = text.slice(0, lineStart) + newLine + text.slice(lineEnd);
    this.el.selectionStart = selectionStart;
    this.el.selectionEnd = selectionStart;
    this.emitCursor();
    return true;
  }

  private onKey(e: KeyboardEvent): void {
    // Más robusto: aceptar Enter, NumpadEnter, y tanto key como code.
    const isEnter = e.key === "Enter" || e.code === "Enter" || e.code === "NumpadEnter";
    const isMod = e.ctrlKey || e.metaKey;
    if (isMod && isEnter) {
      e.preventDefault();
      e.stopPropagation();
      this.onEval(this.el.value);
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const start = this.el.selectionStart;
      const end = this.el.selectionEnd;
      this.el.value = this.el.value.slice(0, start) + "  " + this.el.value.slice(end);
      this.el.selectionStart = this.el.selectionEnd = start + 2;
      this.emitCursor();
    }
  }

  private emitCursor(): void {
    const { selectionStart } = this.el;
    const text = this.el.value;
    const { lineStart, lineEnd } = lineRangeAt(text, selectionStart);
    this.onCursorLine(text.slice(lineStart, lineEnd), lineStart, lineEnd);
  }
}

function lineRangeAt(text: string, pos: number): { lineStart: number; lineEnd: number } {
  let lineStart = pos;
  while (lineStart > 0 && text[lineStart - 1] !== "\n") lineStart--;
  let lineEnd = pos;
  while (lineEnd < text.length && text[lineEnd] !== "\n") lineEnd++;
  return { lineStart, lineEnd };
}
