// AudioContext singleton + utilidades de gesto para móviles.

let ctx: AudioContext | null = null;

export function getCtx(): AudioContext {
  if (!ctx) {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new Ctx();
  }
  return ctx;
}

export async function ensureRunning(): Promise<void> {
  const c = getCtx();
  if (c.state !== "running") await c.resume();
}

export function isSuspended(): boolean {
  return getCtx().state !== "running";
}

export function onStateChange(cb: (state: AudioContextState) => void): void {
  const c = getCtx();
  c.addEventListener("statechange", () => cb(c.state));
}
