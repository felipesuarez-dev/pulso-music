# Pulso — Convenciones del proyecto

Pulso es un entorno de live coding musical en TypeScript. **Lee este archivo antes de modificar nada.**

## Reglas duras (no negociables)

1. **CERO paquetes npm/pnpm/yarn**. No `package.json` con `dependencies`. No `node_modules`. No `bun install`. No imports desde `npm:` ni desde CDNs de paquetes npm. El registro npm está comprometido y el usuario lo prohíbe.
2. **Solo Bun y APIs estándar**: el único binario externo es `bun` (1.3.10+, ya instalado). En frontend solo Web APIs nativas (Web Audio, Canvas, fetch, WebSocket, MediaRecorder).
3. **TypeScript en todo**: backend y frontend.
4. **Tipos de Bun**: declarados a mano en `backend/bun.d.ts` (no usar `bun-types` de npm).
5. **NUNCA añadir `Co-Authored-By:`** en commits — el usuario lo dejó explícito y reiteró.

## Runtime y comandos

Pulso vive en dos puertos en este host:

| Puerto | Rol | Cómo corre | Sobrevive reboot |
|---|---|---|---|
| **4040** | dev (bundle con sourcemaps, sin minify, hot reload) | bare-metal con `./manage.sh dev`/`bg` (en `/home/felipe/pulso`) | no |
| **4050** | producción dockerizada (bundle minificado, `NODE_ENV=production`) | container `pulso` con `restart: unless-stopped` (en `/opt/pulso/`) | sí |

### Comandos del repo (bare-metal, modo dev en 4040)

```bash
./manage.sh start         # foreground (Ctrl+C para parar)
./manage.sh dev           # foreground con --hot reload
./manage.sh bg            # background (logs en pulso.log, PID en pulso.pid)
./manage.sh stop          # detiene el server en background
./manage.sh status        # informa si corre y en qué puerto
./manage.sh build         # genera bundle prod del frontend a disco (dist/)
./manage.sh push-gitea    # crea repo + push a Gitea local
./manage.sh push-github   # push a GitHub vía SSH
./manage.sh push-all      # ambos remotes
```

### Comandos del docker (producción en 4050)

```bash
cd /opt/pulso
./manage.sh start         # docker compose up -d
./manage.sh stop          # docker compose down
./manage.sh restart
./manage.sh status        # estado + uso de recursos
./manage.sh logs live     # logs en tiempo real
./manage.sh build         # rebuild de la imagen pulso:latest
./manage.sh update        # git pull + rebuild + recrear contenedor
./manage.sh backup        # tar.gz de data/ + docker-compose.yml
```

- Acceso LAN dev:      `http://192.168.1.2:4040` (cuando esté arrancado a mano)
- Acceso LAN prod:     `http://192.168.1.2:4050` (siempre arriba via docker)
- Tailscale prod:      `http://100.105.21.49:4050`
- Bundle/CSS cache busting: el HTML inyecta `?v=<mtime>` en cada `<script>` y `<link>` (ver `backend/CLAUDE.md`).

### Notas del Docker

- `Dockerfile` + `.dockerignore` viven en la raíz del repo. Base: `oven/bun:1.3.10-alpine`, user `bun` (uid 1000).
- Infra externa al repo: `/opt/pulso/` (compose + manage.sh + data/logs/backups/). No commitear esa parte aquí — está documentada en `/home/felipe/docs-sv/resumen_PULSO_docker_16052026.txt`.
- El bundle del frontend dentro del contenedor se genera a partir del código copiado en build-time. Tras editar `.ts`, hay que rebuild: `cd /opt/pulso && ./manage.sh update`. Para iterar en caliente, usar el modo dev en 4040.

## Convención de commits

Formato: `[tipo] descripción breve en minúsculas`. **Sin co-author.**

Tipos válidos: `[feat]`, `[fix]`, `[docs]`, `[refactor]`, `[chore]`, `[style]`, `[test]`.

Cuerpo del commit: agrupa por sección con headers en MAYÚSCULAS. Explica el "por qué", no sólo el "qué".

## Estructura del repo

```
pulso/
├── backend/                 → Bun.serve + REST + WebSocket + bundler
├── frontend/                → HTML + TS + CSS, motor Web Audio
│   ├── favicon.svg          → onda de pulso naranja (también usada como logo del README)
│   └── cursor-text.svg      → cursor I-beam custom (visible en fondo oscuro)
├── docs/                    → manual de uso musical (markdown)
├── data/                    → patches guardados (JSON, gitignored)
├── Dockerfile               → imagen para 4050 prod (oven/bun:1.3.10-alpine)
├── .dockerignore            → excluye .git, logs, data, docs, manage.sh, Dockerfile
├── manage.sh                → entrypoint dev/bg/build/push (bare-metal en 4040)
└── .env.example             → plantilla de variables
```

Cada `backend/` y `frontend/` tienen su propio `CLAUDE.md` con reglas locales y mapa de módulos.

## El DSL en breve

API encadenable. Generated session = `pulso()...play()`.

Las primitivas que existen HOY:

- **4 ondas de synth**: `sine`, `square`, `sawtooth`, `triangle`. Todo es síntesis — no hay samples.
- **10 drums sintetizados**: `kick`, `snare`, `hat`, `clap`, `tom`, `rim`, `cowbell`, `ride`, `shaker`, `perc`.
- **16 presets de instrumento** (`.preset('name')`) que aplican `wave + filter + ADSR` de una vez: chiptune (`8bit-lead/bass/arp`), rock (`rock-bass/lead`, `guitar-electric`), acústicos (`guitar-acoustic`, `piano`, `violin`, `flute`, `organ`, `bell`), atmósfera (`pad-warm/cold`, `sub-bass`, `pluck`).
- **11 escalas** con aliases bilingües (es/en): `major`, `minor`, `harmonicMinor`, `pentatonicMin/Maj`, `blues`, `dorian`, `mixolydian`, `phrygian`, `lydian`, `chromatic`.
- **Notación bilingüe**: anglo (C, D, E…) y latina/solfeo (DO, RE, MI…), mezclables en la misma string.
- **Grados de escala**: `1`, `b3`, `5`, `1'` (octava↑), `1,` (octava↓), `_` (sustain), `.` (silencio).
- **Estructura de canción**: `.during(start, end)` por voz + `.songLength(N)` por sesión → intro/verso/coro/break.
- **Multi-pistas con mixer**: vol/pan/mute/solo por pista.
- **`.every(N)`** — voz suena 1 de cada N ciclos.

Documentación completa interactiva: el botón **📘 DSL** del topbar abre un drawer con todo, tooltipped.

## Compatibilidad de export MIDI

El botón **Export MIDI** genera SMF formato 1 con 480 ticks/quarter. Validado para:
- DAWs (Ableton, Logic, Reaper, FL, MuseScore, GarageBand) — drag-and-drop.
- **Pokemon decomp** (pokeemerald, pokeruby, pokefirered): convierte con `mid2agb -G127 archivo.mid 60 0 archivo.s` y copia a `sound/songs/`.
- **MaxMod/Krawall** (motores GBA tracker): abre el `.mid` en OpenMPT/MilkyTracker → guarda como `.xm`/`.s3m` → `mmutil`.

## Filosofía

- Nada de over-engineering. Si una abstracción no se usa al menos dos veces, no existe.
- Sin frameworks. HTML, TS, CSS planos.
- Sin samples ni assets binarios. Todo se sintetiza con osciladores y ruido.
- Acceso desde la LAN: `0.0.0.0` siempre, jamás `localhost` por defecto.
- Validar planes grandes con un agente experto (Plan subagent) antes de implementar.
- Cache-busting agresivo: cualquier cambio en cualquier `.ts` debe poder verse al refrescar el navegador.
