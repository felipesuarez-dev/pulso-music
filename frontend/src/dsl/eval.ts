// Evalúa el código del usuario en un sandbox léxico simple.
// Inyecta `pulso` como argumento. El usuario llama `pulso()....play()`.
// Errores se devuelven como string para mostrar en la UI.

import { pulso } from "./builder.ts";

export interface EvalResult {
  ok: boolean;
  error?: string;
}

export function evalUserCode(code: string): EvalResult {
  try {
    // strict-mode + retornar valor de la última expresión.
    const wrapped = `"use strict";\n${code}`;
    const fn = new Function("pulso", wrapped);
    fn(pulso);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? `${e.name}: ${e.message}` : String(e) };
  }
}
