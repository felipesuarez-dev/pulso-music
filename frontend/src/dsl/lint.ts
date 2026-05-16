// Linter simple del DSL Pulso. No es un parser — sólo reglas de regex sobre
// el texto. Detecta lo que se escribe mal con más frecuencia:
// - paréntesis y comillas desbalanceadas
// - typos comunes (.path → .pattern, .skale → .scale, etc.)
// - caracteres no válidos dentro de .pattern('...')
// - drum/synth con kind/wave desconocido
// - valores fuera de rango (bpm, volume, pan)
//
// El resultado se muestra en la consola debajo del editor.

export type Severity = "error" | "warn" | "info";

export interface Lint {
  severity: Severity;
  line: number;       // 1-indexed
  col?: number;       // 1-indexed
  message: string;
}

const VALID_PATTERN_CHARS = /^[xX._\-\s]*$/;
const KNOWN_DRUMS = new Set(["kick", "snare", "hat", "clap"]);
const KNOWN_WAVES = new Set(["sine", "square", "sawtooth", "triangle"]);

const TYPOS: Array<[RegExp, string]> = [
  [/\.path\(/g,    ".pattern("],
  [/\.pattren\(/g, ".pattern("],
  [/\.skale\(/g,   ".scale("],
  [/\.skala\(/g,   ".scale("],
  [/\.snyth\(/g,   ".synth("],
  [/\.synht\(/g,   ".synth("],
  [/\.bmp\(/g,     ".bpm("],
  [/\.trak\(/g,    ".track("],
  [/\.vol\(/g,     ".volume("],
  [/\.evry\(/g,    ".every("],
  [/\.notess\(/g,  ".notes("],
  [/\.octav\(/g,   ".octave("],
];

export function lintCode(code: string): Lint[] {
  const out: Lint[] = [];
  const lines = code.split("\n");

  // 1) typos
  for (const [pat, suggestion] of TYPOS) {
    const re = new RegExp(pat.source, "g");
    let m: RegExpExecArray | null;
    while ((m = re.exec(code)) !== null) {
      const { line, col } = lineColAt(code, m.index);
      out.push({
        severity: "error",
        line, col,
        message: `Typo: «${m[0].slice(0, -1)}» — ¿quisiste decir «${suggestion.slice(0, -1)}»?`,
      });
    }
  }

  // 2) paréntesis desbalanceados (ignorando los que estén dentro de strings)
  {
    let depth = 0, lastOpenLine = 0;
    const stripped = stripStringsAndComments(code);
    for (let i = 0; i < stripped.length; i++) {
      const c = stripped[i];
      if (c === "(") {
        depth++;
        if (depth === 1) lastOpenLine = lineColAt(code, i).line;
      } else if (c === ")") {
        depth--;
        if (depth < 0) {
          out.push({ severity: "error", ...lineColAt(code, i), message: "Paréntesis ')' sin abrir." });
          depth = 0;
        }
      }
    }
    if (depth > 0) {
      out.push({ severity: "error", line: lastOpenLine, message: `Te faltan ${depth} paréntesis ')' por cerrar.` });
    }
  }

  // 3) comillas desbalanceadas (en cada línea, conteo simple)
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i] ?? "";
    // ignora cadena dentro de strings con escape básico
    const stripped = ln.replace(/\\['"]/g, "");
    const single = (stripped.match(/'/g) ?? []).length;
    const double = (stripped.match(/"/g) ?? []).length;
    if (single % 2 !== 0) out.push({ severity: "error", line: i + 1, message: "Comilla simple ' sin cerrar." });
    if (double % 2 !== 0) out.push({ severity: "error", line: i + 1, message: "Comilla doble \" sin cerrar." });
  }

  // 4) pattern con chars raros
  const patRe = /\.pattern\(\s*['"]([^'"]*)['"]/g;
  {
    let m: RegExpExecArray | null;
    while ((m = patRe.exec(code)) !== null) {
      const content = m[1] ?? "";
      if (!VALID_PATTERN_CHARS.test(content)) {
        const bad = content.match(/[^xX._\-\s]/)?.[0] ?? "?";
        out.push({
          severity: "error",
          ...lineColAt(code, m.index),
          message: `pattern contiene carácter «${bad}» — sólo se admiten x . _ -`,
        });
      }
    }
  }

  // 5) drum kind desconocido
  const drumRe = /\.drum\(\s*['"]([^'"]+)['"]/g;
  {
    let m: RegExpExecArray | null;
    while ((m = drumRe.exec(code)) !== null) {
      const kind = (m[1] ?? "").toLowerCase();
      if (!KNOWN_DRUMS.has(kind)) {
        out.push({
          severity: "error",
          ...lineColAt(code, m.index),
          message: `drum «${kind}» no existe — usa kick / snare / hat / clap`,
        });
      }
    }
  }

  // 6) synth wave desconocida
  const synthRe = /\.synth\(\s*['"]([^'"]+)['"]/g;
  {
    let m: RegExpExecArray | null;
    while ((m = synthRe.exec(code)) !== null) {
      const wave = (m[1] ?? "").toLowerCase();
      if (!KNOWN_WAVES.has(wave)) {
        out.push({
          severity: "error",
          ...lineColAt(code, m.index),
          message: `onda «${wave}» no existe — usa sine / square / sawtooth / triangle`,
        });
      }
    }
  }

  // 7) rangos numéricos
  for (const [re, range, label] of [
    [/\.bpm\(\s*(-?\d+(?:\.\d+)?)/g,    [20, 400], "bpm"],
    [/\.volume\(\s*(-?\d+(?:\.\d+)?)/g, [0, 1.5], "volume"],
    [/\.pan\(\s*(-?\d+(?:\.\d+)?)/g,    [-1, 1], "pan"],
  ] as const) {
    let m: RegExpExecArray | null;
    const r = new RegExp(re.source, "g");
    while ((m = r.exec(code)) !== null) {
      const val = parseFloat(m[1] ?? "0");
      const [lo, hi] = range;
      if (val < lo || val > hi) {
        out.push({
          severity: "warn",
          ...lineColAt(code, m.index),
          message: `${label}(${val}) fuera de rango ${lo}..${hi}`,
        });
      }
    }
  }

  // Orden por línea, luego severity (errores antes que warnings)
  return out.sort((a, b) => a.line - b.line || sevWeight(a.severity) - sevWeight(b.severity));
}

function sevWeight(s: Severity): number {
  return s === "error" ? 0 : s === "warn" ? 1 : 2;
}

function lineColAt(text: string, index: number): { line: number; col: number } {
  let line = 1, col = 1;
  for (let i = 0; i < index; i++) {
    if (text[i] === "\n") { line++; col = 1; }
    else col++;
  }
  return { line, col };
}

// Reemplaza el contenido de strings y comentarios por espacios para que
// el count de paréntesis no se confunda con un ')' dentro de un literal.
function stripStringsAndComments(code: string): string {
  let out = "";
  let i = 0;
  while (i < code.length) {
    const c = code[i];
    // comentario //
    if (c === "/" && code[i + 1] === "/") {
      while (i < code.length && code[i] !== "\n") { out += " "; i++; }
      continue;
    }
    // comentario /* */
    if (c === "/" && code[i + 1] === "*") {
      out += "  ";
      i += 2;
      while (i < code.length && !(code[i] === "*" && code[i + 1] === "/")) {
        out += code[i] === "\n" ? "\n" : " ";
        i++;
      }
      out += "  ";
      i += 2;
      continue;
    }
    // string
    if (c === '"' || c === "'" || c === "`") {
      const quote = c;
      out += " ";
      i++;
      while (i < code.length && code[i] !== quote) {
        if (code[i] === "\\") { out += "  "; i += 2; continue; }
        out += code[i] === "\n" ? "\n" : " ";
        i++;
      }
      out += " ";
      i++;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}
