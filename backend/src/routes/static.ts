import { getBundle, getBundleVersion } from "../lib/bundle.ts";

const FRONTEND_DIR = "frontend";

export async function serveStatic(_req: Request, url: URL, dev: boolean): Promise<Response> {
  const p = url.pathname;

  if (p === "/" || p === "/index.html") {
    // Inyecta cache-buster en la URL del bundle: bundle.js → bundle.js?v=<mtime>
    // Así un cambio de código fuerza al navegador a ir por el bundle nuevo.
    const f = Bun.file(`${FRONTEND_DIR}/index.html`);
    if (!(await f.exists())) return new Response("not found", { status: 404 });
    const html = await f.text();
    const v = await getBundleVersion();
    const stamped = html
      .replace('src="/bundle.js"', `src="/bundle.js?v=${v}"`)
      .replace('href="/styles.css"', `href="/styles.css?v=${v}"`);
    return new Response(stamped, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  }
  if (p === "/styles.css") {
    const f = Bun.file(`${FRONTEND_DIR}/styles.css`);
    if (!(await f.exists())) return new Response("not found", { status: 404 });
    return new Response(await f.text(), {
      headers: {
        "content-type": "text/css; charset=utf-8",
        "cache-control": dev ? "no-store" : "public, max-age=86400, immutable",
      },
    });
  }
  if (p === "/favicon.svg" || p === "/favicon.ico") {
    const f = Bun.file(`${FRONTEND_DIR}/favicon.svg`);
    if (!(await f.exists())) return new Response("not found", { status: 404 });
    return new Response(await f.text(), {
      headers: {
        "content-type": "image/svg+xml",
        "cache-control": "public, max-age=86400",
      },
    });
  }
  if (p === "/bundle.js") {
    try {
      const code = await getBundle(dev);
      return new Response(code, {
        headers: {
          "content-type": "application/javascript; charset=utf-8",
          // immutable porque la URL ya lleva ?v=<mtime>; el navegador puede cachear sin miedo.
          "cache-control": dev ? "no-store" : "public, max-age=86400, immutable",
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
