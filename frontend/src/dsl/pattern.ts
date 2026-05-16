// Parser de strings de patrón rítmico: "x.x.x.x." → [true,false,true,false,true,false,true,false].
// Acepta espacios para legibilidad: "x... x... x... x..." ≡ "x...x...x...x...".
// Caracteres válidos: 'x' / 'X' = hit, '.' / '_' / '-' = silencio.

export function parsePattern(input: string): boolean[] {
  const cleaned = input.replace(/\s+/g, "");
  const out: boolean[] = [];
  for (const c of cleaned) {
    if (c === "x" || c === "X") out.push(true);
    else if (c === "." || c === "_" || c === "-") out.push(false);
    else throw new Error(`carácter inválido en patrón: "${c}"`);
  }
  return out;
}

export function patternToString(steps: boolean[]): string {
  return steps.map((s) => (s ? "x" : ".")).join("");
}
