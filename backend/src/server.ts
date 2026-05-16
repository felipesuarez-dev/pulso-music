import { loadEnv } from "./lib/env.ts";
import { PatchStore } from "./storage/patches.ts";
import { serveStatic } from "./routes/static.ts";
import { makePatchesRouter } from "./routes/patches.ts";
import { wsHandler } from "./routes/ws.ts";

const env = loadEnv();
const store = new PatchStore(env.dataDir);
await store.ensure();

const dev = Bun.env.NODE_ENV !== "production";
const patches = makePatchesRouter(store);

const server = Bun.serve({
  port: env.port,
  hostname: env.host,
  development: dev,
  websocket: wsHandler,
  async fetch(req, server) {
    const url = new URL(req.url);

    if (url.pathname === "/ws") {
      const ok = server.upgrade(req);
      return ok
        ? new Response(null, { status: 101 })
        : new Response("upgrade failed", { status: 400 });
    }

    if (url.pathname.startsWith("/api/patches")) {
      return patches(req, url);
    }

    return serveStatic(req, url, dev);
  },
});

console.log(`pulso listening on http://${server.hostname}:${server.port} (dev=${dev})`);
