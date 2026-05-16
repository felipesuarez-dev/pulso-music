import { mkdir, readdir, unlink } from "node:fs/promises";
import { join } from "node:path";

export interface Patch {
  id: string;
  name: string;
  code: string;
  updatedAt: number;
}

export class PatchStore {
  constructor(private readonly dir: string) {}

  async ensure(): Promise<void> {
    await mkdir(join(this.dir, "patches"), { recursive: true });
  }

  async list(): Promise<Array<Pick<Patch, "id" | "name" | "updatedAt">>> {
    const dir = join(this.dir, "patches");
    const files = await readdir(dir).catch(() => [] as string[]);
    const patches: Array<Pick<Patch, "id" | "name" | "updatedAt">> = [];
    for (const f of files) {
      if (!f.endsWith(".json")) continue;
      const p = await this.get(f.replace(/\.json$/, ""));
      if (p) patches.push({ id: p.id, name: p.name, updatedAt: p.updatedAt });
    }
    return patches.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async get(id: string): Promise<Patch | null> {
    const path = this.path(id);
    const file = Bun.file(path);
    if (!(await file.exists())) return null;
    return (await file.json()) as Patch;
  }

  async save(patch: Patch): Promise<Patch> {
    const updated: Patch = { ...patch, updatedAt: Date.now() };
    await Bun.write(this.path(updated.id), JSON.stringify(updated, null, 2));
    return updated;
  }

  async remove(id: string): Promise<boolean> {
    const path = this.path(id);
    const file = Bun.file(path);
    if (!(await file.exists())) return false;
    await unlink(path);
    return true;
  }

  private path(id: string): string {
    const safe = id.replace(/[^a-z0-9_-]/gi, "_");
    return join(this.dir, "patches", `${safe}.json`);
  }
}
