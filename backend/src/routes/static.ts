import { getBundle } from "../lib/bundle.ts";

const FRONTEND_DIR = "frontend";

export async function serveStatic(req: Request, url: URL, dev: boolean): Promise<Response> {
  const p = url.pathname;

  if (p === "/" || p === "/index.html") {
    return file(`${FRONTEND_DIR}/index.html`, "text/html; charset=utf-8");
  }
  if (p === "/styles.css") {
    return file(`${FRONTEND_DIR}/styles.css`, "text/css; charset=utf-8");
  }
  if (p === "/bundle.js") {
    try {
      const code = await getBundle(dev);
      return new Response(code, {
        headers: {
          "content-type": "application/javascript; charset=utf-8",
          "cache-control": dev ? "no-store" : "public, max-age=60",
        },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return new Response(`// bundle error\nconsole.error(${JSON.stringify(msg)});`, {
        status: 500,
        headers: { "content-type": "application/javascript; charset=utf-8" },
      });
    }
  }
  return new Response("not found", { status: 404 });
}

async function file(path: string, contentType: string): Promise<Response> {
  const f = Bun.file(path);
  if (!(await f.exists())) return new Response("not found", { status: 404 });
  return new Response(await f.text(), { headers: { "content-type": contentType } });
}
