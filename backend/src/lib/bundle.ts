import { stat, readdir } from "node:fs/promises";
import { join } from "node:path";

const ENTRY = "frontend/src/main.ts";
const SRC_ROOT = "frontend/src";

let cached: { mtime: number; code: string } | null = null;

export async function getBundle(dev: boolean): Promise<string> {
  const mtime = await maxSourceMtime();
  if (cached && cached.mtime === mtime) return cached.code;

  const out = await Bun.build({
    entrypoints: [ENTRY],
    target: "browser",
    format: "esm",
    minify: !dev,
    sourcemap: dev ? "inline" : "none",
  });

  if (!out.success) {
    const errs = out.logs.map((l) => l.message).join("\n");
    throw new Error("bundle failed:\n" + errs);
  }

  const first = out.outputs[0];
  if (!first) throw new Error("bundle produced no outputs");
  const code = await first.text();
  cached = { mtime, code };
  return code;
}

// Versión cacheada del bundle para cache-busting en URLs (?v=NNN).
export async function getBundleVersion(): Promise<number> {
  return Math.floor(await maxSourceMtime());
}

// Mira el mtime más reciente de cualquier .ts bajo frontend/src/. Así una
// edición en cualquier módulo invalida el cache, no sólo en main.ts.
async function maxSourceMtime(): Promise<number> {
  let max = 0;
  for await (const f of walk(SRC_ROOT)) {
    if (!f.endsWith(".ts")) continue;
    const s = await stat(f);
    if (s.mtimeMs > max) max = s.mtimeMs;
  }
  return max;
}

async function* walk(dir: string): AsyncGenerator<string> {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}
