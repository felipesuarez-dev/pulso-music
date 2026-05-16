// Cliente del REST de patches. Carga/guarda/borra contra /api/patches.

export interface PatchSummary { id: string; name: string; updatedAt: number; }
export interface Patch extends PatchSummary { code: string; }

export async function listPatches(): Promise<PatchSummary[]> {
  const r = await fetch("/api/patches");
  if (!r.ok) return [];
  return (await r.json()) as PatchSummary[];
}

export async function getPatch(id: string): Promise<Patch | null> {
  const r = await fetch(`/api/patches/${encodeURIComponent(id)}`);
  if (!r.ok) return null;
  return (await r.json()) as Patch;
}

export async function savePatch(p: Omit<Patch, "updatedAt">): Promise<Patch> {
  const r = await fetch("/api/patches", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(p),
  });
  return (await r.json()) as Patch;
}

export async function deletePatch(id: string): Promise<boolean> {
  const r = await fetch(`/api/patches/${encodeURIComponent(id)}`, { method: "DELETE" });
  return r.ok;
}
