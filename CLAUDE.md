# Pulso — Convenciones del proyecto

Pulso es un entorno de live coding musical en TypeScript. Lee este archivo antes de modificar nada.

## Reglas duras (no negociables)

1. **CERO paquetes npm/pnpm/yarn**. No `package.json` con `dependencies`. No `node_modules`. No `bun install`. No imports desde `npm:` ni desde CDNs de paquetes npm. El registro npm está comprometido y el usuario lo prohíbe.
2. **Solo Bun y APIs estándar**: el único binario externo es `bun` (1.3.10+, ya instalado). En frontend solo Web APIs nativas (Web Audio, Canvas, fetch, WebSocket, MediaRecorder).
3. **TypeScript en todo**: backend y frontend.
4. **Tipos de Bun**: declarados a mano en `backend/bun.d.ts` (no usar `bun-types` de npm).

## Runtime y comandos

```bash
./manage.sh start         # producción
./manage.sh dev           # con --hot reload
./manage.sh build         # genera bundle del frontend a disco
./manage.sh push-gitea    # crea repo + push a Gitea local
./manage.sh push-github   # crea repo + push a GitHub
./manage.sh push-all      # ambos remotes
```

El servidor escucha en `0.0.0.0:4000` por defecto. Editable en `.env`.

## Convención de commits

Formato: `[tipo] descripción breve en minúsculas`.

Tipos válidos:
- `[feat]` — nueva funcionalidad
- `[fix]` — corrección de bug
- `[docs]` — solo documentación
- `[refactor]` — sin cambio funcional
- `[chore]` — config, tooling, scripts
- `[style]` — formato/css
- `[test]` — solo tests

**NUNCA añadir línea `Co-Authored-By:`** en ningún commit. El usuario lo dejó explícito.

## Estructura

```
pulso/
├── backend/   → Bun.serve + REST + WebSocket + bundler
├── frontend/  → HTML + TS + CSS, motor Web Audio
├── docs/      → manual de uso musical
├── data/      → patches guardados (JSON, gitignored)
└── manage.sh  → entrypoint de scripts
```

Cada `backend/` y `frontend/` tienen su propio `CLAUDE.md` con reglas locales.

## Filosofía

- Nada de over-engineering. Si una abstracción no se usa al menos dos veces, no existe.
- Sin frameworks. HTML, TS, CSS planos.
- Sin samples ni assets binarios. Todo se sintetiza con osciladores y ruido.
- Acceso desde la LAN: `0.0.0.0` siempre, jamás `localhost` por defecto.
