# backend/ — Reglas

Servidor Bun. Sirve estáticos del frontend, expone REST para patches y un WebSocket de live-sync.

## Reglas

- **Sólo APIs de Bun** y la stdlib (`node:fs/promises`, `node:path` están OK por ser built-in de Bun). Nada de imports `npm:` ni paquetes externos.
- Tipos de Bun: ver `bun.d.ts`. Si necesitas un tipo nuevo (otro método de `Bun.*`), agrégalo a mano ahí — NO instalar `bun-types`.
- Configuración: lee siempre desde `lib/env.ts`. Nunca `process.env` directo.
- Bundling del frontend: pasa por `lib/bundle.ts` (cache por **max mtime** de todo `frontend/src/**/*.ts`, no sólo del entrypoint).
- HTML servido inyecta automáticamente `?v=<mtime>` en `<script src="/bundle.js">` y `<link href="/styles.css">` para forzar cache-bust del navegador en cada cambio de código.

## Estructura

```
backend/
├── bun.d.ts                 # tipos manuales del global Bun (serve, build, file, write, env)
├── tsconfig.json
└── src/
    ├── server.ts            # Bun.serve, ruteo principal
    ├── routes/
    │   ├── static.ts        # /, /index.html, /styles.css, /bundle.js, /favicon.svg, /cursor-text.svg
    │   ├── patches.ts       # /api/patches CRUD (list, get, save, delete)
    │   └── ws.ts            # /ws live-sync entre dispositivos en LAN
    ├── storage/
    │   └── patches.ts       # JSON files en ./data/patches/
    └── lib/
        ├── env.ts           # carga PORT/HOST/DATA_DIR tipados
        └── bundle.ts        # cache de Bun.build invalidado por mtime máximo
```

## Cómo añadir un endpoint REST

1. Crear el handler en `routes/<algo>.ts` exportando `(req: Request, url: URL) => Response | Promise<Response>`.
2. Montar el path en `server.ts` dentro del fetch handler (usa `url.pathname.startsWith(...)`).
3. Devolver JSON con `new Response(JSON.stringify(...), { headers: { "content-type": "application/json" } })`.

## Cómo añadir un asset estático

1. Pon el archivo en `frontend/` (mismo nivel que `index.html`, `styles.css`).
2. Agrega un branch en `routes/static.ts` que lo sirva con el `content-type` correcto.
3. Si es un asset versionable (puede cambiar en cada release), recuerda añadir `?v=<mtime>` al usarlo desde HTML — o sólo `cache-control: no-store` si es desarrollo.

## Cómo cambiar el cache del bundle

Está en `lib/bundle.ts`. La función `maxSourceMtime()` walkea `frontend/src/**/*.ts`. Si añades otra carpeta de fuentes (p.ej. `frontend/lib/`), inclúyela en el walk.
