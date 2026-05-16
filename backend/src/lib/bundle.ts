import { stat } from "node:fs/promises";

const ENTRY = "frontend/src/main.ts";

let cached: { mtime: number; code: string } | null = null;

export async function getBundle(dev: boolean): Promise<string> {
  const mtime = await currentMtime();
  if (!dev && cached && cached.mtime === mtime) return cached.code;

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

async function currentMtime(): Promise<number> {
  const s = await stat(ENTRY);
  return s.mtimeMs;
}
