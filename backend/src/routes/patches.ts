import type { PatchStore, Patch } from "../storage/patches.ts";

export function makePatchesRouter(store: PatchStore) {
  return async (req: Request, url: URL): Promise<Response> => {
    const parts = url.pathname.split("/").filter(Boolean); // ["api","patches",id?]
    const id = parts[2];

    if (!id) {
      if (req.method === "GET") {
        return json(await store.list());
      }
      if (req.method === "POST") {
        const body = (await req.json()) as Partial<Patch>;
        if (!body.id || !body.name || typeof body.code !== "string") {
          return json({ error: "id, name, code requeridos" }, 400);
        }
        const saved = await store.save({
          id: body.id,
          name: body.name,
          code: body.code,
          updatedAt: 0,
        });
        return json(saved);
      }
      return notAllowed();
    }

    if (req.method === "GET") {
      const p = await store.get(id);
      return p ? json(p) : json({ error: "no encontrado" }, 404);
    }
    if (req.method === "DELETE") {
      const ok = await store.remove(id);
      return json({ ok });
    }
    return notAllowed();
  };
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function notAllowed(): Response {
  return new Response("method not allowed", { status: 405 });
}
