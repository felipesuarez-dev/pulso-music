// Evalúa el código del usuario en un sandbox léxico simple.
// Inyecta `pulso` como argumento. Los errores se devuelven estructurados con
// línea/columna cuando se pueden extraer del stack trace.

import { pulso } from "./builder.ts";

export interface EvalResult {
  ok: boolean;
  error?: string;
  line?: number;        // 1-indexed, en el código del USUARIO
  col?: number;
}

export function evalUserCode(code: string): EvalResult {
  try {
    // Envolvemos en "use strict" — eso añade 1 línea, así que cualquier line
    // number del runtime hay que decrementarlo en 1 para que apunte al código
    // que el usuario realmente escribió.
    const wrapped = `"use strict";\n${code}`;
    const fn = new Function("pulso", wrapped);
    fn(pulso);
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    const stack = e instanceof Error ? (e.stack ?? "") : "";
    const loc = extractLoc(stack);
    return {
      ok: false,
      error: msg,
      line: loc?.line,
      col: loc?.col,
    };
  }
}

// Busca un location tipo `<anonymous>:LINE:COL` o `eval at ... :LINE:COL`.
// El número de línea es relativo al cuerpo de la función envuelta — restamos
// 1 por la línea `"use strict";` que agregamos.
function extractLoc(stack: string): { line: number; col?: number } | undefined {
  const lines = stack.split("\n");
  for (const ln of lines) {
    const m = /<anonymous>:(\d+)(?::(\d+))?/.exec(ln)
            ?? /\(eval at.*?:(\d+)(?::(\d+))?/.exec(ln);
    if (m) {
      const wrappedLine = parseInt(m[1] ?? "1", 10);
      const userLine = wrappedLine - 1;
      if (userLine < 1) continue;
      const col = m[2] ? parseInt(m[2], 10) : undefined;
      return { line: userLine, col };
    }
  }
  return undefined;
}
