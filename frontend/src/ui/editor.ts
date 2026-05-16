// Wrapper simple sobre <textarea>. Atajos:
//   Ctrl+Enter / Cmd+Enter → evalúa
//   Tab → inserta dos espacios
// Emite evento de "línea bajo el cursor" para que la grid sepa qué patrón mostrar.

export type EvalCb = (code: string) => void;
export type CursorLineCb = (line: string, lineStart: number, lineEnd: number) => void;

export class Editor {
  constructor(
    private readonly el: HTMLTextAreaElement,
    private readonly onEval: EvalCb,
    private readonly onCursorLine: CursorLineCb,
  ) {
    this.el.addEventListener("keydown", (e) => this.onKey(e));
    const emit = () => this.emitCursor();
    this.el.addEventListener("click", emit);
    this.el.addEventListener("keyup", emit);
    this.el.addEventListener("input", emit);
  }

  setCode(code: string): void {
    this.el.value = code;
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
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
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
