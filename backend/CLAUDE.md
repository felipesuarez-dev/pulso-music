# backend/ — Reglas

Servidor Bun. Sirve estáticos del frontend, expone REST para patches y un WebSocket de live-sync.

## Reglas

- **Sólo APIs de Bun** y la stdlib. Nada de imports `npm:`/`node:` que requieran instalar paquetes (los `node:fs`, `node:path` que vienen built-in con Bun sí).
- Tipos de Bun: ver `bun.d.ts` en este directorio. Si necesitas un tipo nuevo, agrégalo ahí a mano.
- Configuración: lee siempre desde `lib/env.ts`, nunca `process.env` directo.
- Bundling del frontend: pasa por `lib/bundle.ts` (cache por mtime). No hacer `Bun.build` ad-hoc.

## Estructura

```
backend/
├── bun.d.ts              # tipos manuales del global Bun
├── tsconfig.json
└── src/
    ├── server.ts         # Bun.serve, monta rutas
    ├── routes/
    │   ├── static.ts     # /  /styles.css  /bundle.js  /index.html
    │   ├── patches.ts    # /api/patches CRUD
    │   └── ws.ts         # /ws live-sync
    ├── storage/
    │   └── patches.ts    # read/write JSON
    └── lib/
        ├── env.ts
        └── bundle.ts
```

## Cómo añadir un endpoint

1. Crear el handler en `routes/<algo>.ts` exportando `(req: Request) => Response | Promise<Response>`.
2. Montar el path en `server.ts` dentro del switch del fetch handler.
