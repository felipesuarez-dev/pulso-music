<div align="center">

<img src="frontend/favicon.svg" alt="Pulso" width="120" />

# Pulso

**Live coding musical en TypeScript, 100% web, sin npm, sin samples, sin frameworks.**

[![Bun][bun-badge]][bun-link]
[![TypeScript][ts-badge]][ts-link]
[![Docker][docker-badge]][docker-link]
[![Web Audio][webaudio-badge]][webaudio-link]
[![License][license-badge]](LICENSE)
[![PumaSoft][pumasoft-badge]][pumasoft-link]

[Quick Start](#quick-start) · [The DSL in 30 seconds](#the-dsl-in-30-seconds) · [Features](#features) · [Deployment](#deployment) · [Architecture](#architecture) · [Project Structure](#project-structure)

</div>

---

## Problem

Las herramientas establecidas de live coding (Sonic Pi, Tidal Cycles, Strudel, ORCA) cargan runtimes pesados — Ruby, Haskell, npm con cientos de dependencias — y suelen depender de samples binarios para sonar. En un servidor casero o una jam session en LAN, esa fricción mata el flujo: instalar, autorizar, sincronizar entre dispositivos, parchear vulnerabilidades del registro npm que se ha caído como una piñata últimamente.

## Solution

Pulso es un editor de live coding web que cabe en un solo proceso Bun y un puñado de archivos `.ts`/`.css`. Cualquier dispositivo con navegador en la LAN abre `http://servidor:4050/` y ya está tocando — sin instalación cliente, sin samples descargables, sin un solo paquete npm. Todo el audio se sintetiza en tiempo real con Web Audio (osciladores + ruido + filtros + ADSR).

- **CERO dependencias npm/pnpm/yarn** — el registro npm está fuera por diseño (supply chain).
- **Solo Bun + APIs nativas** — el binario externo es uno: `bun`. Web Audio, Canvas, WebSocket, fetch, MediaRecorder en el browser.
- **Sin samples** — 4 ondas + 10 percusiones + 16 presets de instrumento, todo síntesis.
- **Notación bilingüe** — anglosajona (`C D E`) y latina/solfeo (`DO RE MI`), mezclables en la misma string.
- **Live-sync entre dispositivos** vía WebSocket: una tablet edita, el portátil toca.
- **Export MIDI** compatible con DAWs y con decomp de Pokemon GBA (`mid2agb`).

## Quick Start

### Modo dev (foreground, hot reload)

```bash
git clone https://github.com/felipesuarez-dev/pulso-music.git pulso
cd pulso
./manage.sh dev          # http://0.0.0.0:4040 con bun --hot
```

Requiere [Bun](https://bun.sh) 1.3.10+ instalado. No hay `bun install` — el proyecto vive sin `node_modules`.

### Modo producción (Docker, recomendado para dejarlo permanentemente arriba)

```bash
git clone https://github.com/felipesuarez-dev/pulso-music.git pulso
docker build -t pulso:latest pulso/
docker run -d --name pulso --restart unless-stopped \
  -p 4050:4040 -v $(pwd)/pulso-data:/app/data pulso:latest
```

Abre `http://localhost:4050/` (o `http://<ip-LAN>:4050/` desde otro dispositivo). El volumen `pulso-data` guarda los patches del usuario fuera del contenedor. Ver [Deployment](#deployment) para el `docker-compose.yml` completo con labels Glance y healthcheck.

## The DSL in 30 seconds

```ts
pulso()
  .bpm(124)
  .track('drums')
    .drum('kick').pattern('x...x...x...x...')
    .drum('snare').pattern('....x.......x...')
    .drum('hat').pattern('x.x.x.x.x.x.x.x.')
  .track('bass').volume(0.8)
    .synth('sawtooth')
      .scale('Am')
      .notes('1 1 5 1 b7 1 5 1')
      .filter(500).release(0.25)
  .track('lead').pan(0.3).volume(0.6)
    .preset('8bit-lead')
      .scale('Cm pent')
      .notes("1' . b3' 5' . 4' b3' 1'")
      .every(2)
  .play();
```

Pulsa `Ctrl+Enter` en el editor y suena. El botón **📘 DSL** del topbar abre un drawer con la referencia completa, tooltipped.

## Features

| Area | Qué hace |
|---|---|
| **DSL encadenable** | `pulso()...play()`. Tipado, autocompletable, sin macros raras. Una sesión = una expresión. |
| **4 ondas + 10 drums** | `sine` / `square` / `sawtooth` / `triangle` + `kick` / `snare` / `hat` / `clap` / `tom` / `rim` / `cowbell` / `ride` / `shaker` / `perc`. Todo síntesis. |
| **16 presets de instrumento** | `.preset('name')` aplica wave + filter + ADSR de una vez. Chiptune (`8bit-lead/bass/arp`), rock (`rock-bass/lead`, `guitar-electric`), acústicos (`piano`, `violin`, `flute`, `organ`, `bell`, `guitar-acoustic`), atmósfera (`pad-warm/cold`, `sub-bass`, `pluck`). |
| **11 escalas bilingües** | `major`, `minor`, `harmonicMinor`, `pentatonicMin/Maj`, `blues`, `dorian`, `mixolydian`, `phrygian`, `lydian`, `chromatic`. Cada una con alias ES/EN. |
| **Notación mezclable** | `C` o `DO`, `F#` o `FA#`, en la misma string. Internamente todo se canonicaliza. |
| **Grados de escala** | `1`, `b3`, `5`, `1'` (octava↑), `1,` (octava↓), `_` (sustain), `.` (silencio). |
| **Estructura de canción** | `.during(start, end)` por voz + `.songLength(N)` por sesión → intro / verso / coro / break. |
| **Multi-pistas con mixer** | Vol / pan / mute / solo por pista, sincronizado al grid visual. |
| **`.every(N)`** | Voz suena 1 de cada N ciclos — útil para fills y disparadores escasos. |
| **Live-sync LAN** | WebSocket `/ws`: una pestaña edita, las otras se actualizan. Ideal para jam con tablet + portátil. |
| **Persistencia de patches** | REST `/api/patches` → JSON files en `data/patches/`. Sin base de datos. |
| **Visualización en vivo** | Waveform + espectro por pista en tiempo real (Canvas). |
| **Export MIDI** | SMF formato 1, 480 ticks/quarter. DAWs + Pokemon decomp (`mid2agb`) + GBA tracker (OpenMPT → MOD/XM). |

## Deployment

Pulso se puede desplegar de dos maneras complementarias en el mismo host:

| Puerto | Rol | Cómo corre | Auto-restart |
|---|---|---|---|
| **4040** | dev (bundle con sourcemaps, sin minify, hot reload) | `./manage.sh dev` o `bg` (bare-metal Bun) | no |
| **4050** | producción (bundle minificado, `NODE_ENV=production`) | Docker container | sí (`restart: unless-stopped`) |

### Docker (producción)

`Dockerfile` y `.dockerignore` viven en la raíz del repo. La imagen base es `oven/bun:1.3.10-alpine`, el contenedor corre como usuario `bun` (uid 1000) y tiene un healthcheck `wget` interno cada 30s.

`docker-compose.yml` mínimo:

```yaml
services:
  pulso:
    image: pulso:latest
    build: .
    container_name: pulso
    restart: unless-stopped
    ports:
      - "4050:4040"
    environment:
      - TZ=America/Santiago
      - NODE_ENV=production
      - HOST=0.0.0.0
      - PORT=4040
      - DATA_DIR=/app/data
    volumes:
      - ./data:/app/data
    labels:
      - "glance.enable=true"
      - "glance.name=Pulso"
      - "glance.description=Entorno de live coding musical (TypeScript + Web Audio)"
      - "glance.url=http://192.168.1.2:4050"
      - "glance.icon=si:musicbrainz"
      - "glance.category=development"
```

Operación:

```bash
docker compose build --pull        # construir la imagen
docker compose up -d               # arrancar en background
docker compose logs -f             # logs en vivo
docker compose down                # parar y eliminar el container
```

Para auto-update tras publicar la imagen a un registry (Gitea / Docker Hub / GHCR), cambiar el bloque `build:` por `image: <registry>/pulso:latest` + `pull_policy: always`. Combina con [watchtower](https://github.com/containrrr/watchtower) o un cron de `docker compose pull && up -d` para actualizaciones automáticas.

### `manage.sh` (modo dev en bare-metal)

```bash
./manage.sh start         # producción foreground (Ctrl+C para parar)
./manage.sh dev           # foreground con --hot reload
./manage.sh bg            # background (logs en pulso.log, PID en pulso.pid)
./manage.sh stop          # detener el server en background
./manage.sh status        # estado y puerto
./manage.sh build         # bundle prod del frontend a disco (dist/)
./manage.sh push-gitea    # crear repo + push a Gitea
./manage.sh push-github   # push a GitHub via SSH
./manage.sh push-all      # ambos remotes
```

## Architecture

```mermaid
flowchart TB
    subgraph Browser["🌐 Browser (cualquier dispositivo LAN)"]
        direction LR
        UI["ui/<br/>editor · grid · mixer · scope · drawer DSL"]
        DSL["dsl/<br/>parser + lexer del API encadenable"]
        Engine["engine/<br/>Web Audio: osc · drums · presets · ADSR · mix"]
        UI --> DSL --> Engine
    end

    subgraph Backend["⚡ Bun.serve (backend/)"]
        direction LR
        Static["routes/static.ts<br/>/, /bundle.js, /styles.css, /favicon"]
        Patches["routes/patches.ts<br/>/api/patches CRUD"]
        WS["routes/ws.ts<br/>/ws live-sync"]
        Bundle["lib/bundle.ts<br/>Bun.build cacheado por mtime"]
        Env["lib/env.ts<br/>PORT · HOST · DATA_DIR"]
        Storage["storage/patches.ts<br/>JSON files"]
        Static -.-> Bundle
        Patches --> Storage
    end

    Disk[("📁 data/patches/<br/>*.json")]

    Browser -- "HTTP (REST + bundle)" --> Static
    Browser -- "HTTP (REST + bundle)" --> Patches
    Browser <-- "WebSocket /ws<br/>live-sync entre clientes" --> WS
    Storage --> Disk

    classDef browser fill:#1a1f2e,stroke:#ff8c00,stroke-width:2px,color:#fff
    classDef backend fill:#0d1117,stroke:#fbf0df,stroke-width:2px,color:#fff
    classDef disk fill:#2d1b00,stroke:#ff8c00,stroke-width:1px,color:#fff
    class Browser browser
    class Backend backend
    class Disk disk
```

Reglas: el frontend nunca toca disco directamente — pasa por REST. El backend nunca importa nada que no sea Bun stdlib + `node:fs/promises` / `node:path` (built-in de Bun). El bundle del frontend se genera **on-the-fly** en el primer request y se cachea por mtime máximo de cualquier `.ts` bajo `frontend/src/` (cualquier edición invalida el cache, no sólo `main.ts`). El HTML inyecta `?v=<mtime>` en cada `<script>` y `<link>` para cache-bust agresivo del navegador.

## Tech Stack

| Backend | Frontend | Build / Infra |
|---|---|---|
| Bun 1.3.10 | TypeScript estricto | `Bun.build` (sin Vite/webpack/esbuild externos) |
| `Bun.serve` (HTTP + WS) | Web Audio API | Docker (`oven/bun:1.3.10-alpine`) |
| TypeScript estricto | Canvas (scope + grid) | `manage.sh` (bash) |
| `node:fs/promises` | WebSocket nativo | Glance dashboard labels |
| Tipos manuales en `backend/bun.d.ts` | Sin frameworks | Volumen `./data` para patches |

**Lo que NO está aquí**: React / Vue / Svelte / Lit, npm / pnpm / yarn, samples binarios, Web Audio worklets de terceros, CDNs externos, base de datos.

## Project Structure

```
pulso/
├── backend/                      Bun.serve + REST + WebSocket + bundler
│   ├── CLAUDE.md                 reglas locales del backend (mapa de módulos)
│   ├── bun.d.ts                  tipos manuales del global Bun (sin bun-types)
│   ├── tsconfig.json
│   └── src/
│       ├── server.ts             entry: Bun.serve, ruteo principal
│       ├── routes/
│       │   ├── static.ts         /, /bundle.js, /styles.css, /favicon.svg
│       │   ├── patches.ts        /api/patches CRUD
│       │   └── ws.ts             /ws live-sync entre clientes LAN
│       ├── storage/patches.ts    JSON files en ./data/patches/
│       └── lib/
│           ├── env.ts            PORT / HOST / DATA_DIR tipados
│           └── bundle.ts         Bun.build cacheado por mtime máximo
├── frontend/                     HTML + TS + CSS, motor Web Audio
│   ├── CLAUDE.md                 reglas locales del frontend (mapa de módulos)
│   ├── index.html
│   ├── styles.css
│   ├── tsconfig.json
│   ├── favicon.svg               onda de pulso naranja (también logo del README)
│   ├── cursor-text.svg           I-beam custom para fondo oscuro
│   └── src/
│       ├── main.ts               bootstrap del editor
│       ├── types.ts
│       ├── dsl/                  parser del API encadenable
│       ├── engine/               Web Audio: osc, drums, presets, ADSR, mix
│       └── ui/                   editor, grid, mixer, scope, drawer DSL
├── docs/                         manual de uso musical (markdown)
│   ├── 01-getting-started.md
│   ├── 02-dsl-reference.md
│   ├── 03-examples.md
│   ├── 04-architecture.md
│   ├── 05-deployment.md
│   ├── 06-notation-and-scales.md
│   └── 07-tracks-and-midi-export.md
├── data/                         patches guardados (gitignored)
├── .github/
│   └── workflows/
│       └── release.yml           build estático + imagen Docker → GH Release draft
├── Dockerfile                    oven/bun:1.3.10-alpine, user bun (uid 1000)
├── .dockerignore
├── tsconfig.base.json            tsconfig raíz compartido por backend y frontend
├── manage.sh                     entrypoint dev/bg/build/push (bare-metal en 4040)
├── CLAUDE.md                     convenciones globales del proyecto
└── README.md
```

Los tres `CLAUDE.md` (root, `backend/`, `frontend/`) se cargan automáticamente cuando alguien trabaja en el directorio correspondiente y contienen reglas duras + mapa de módulos para que cualquier colaborador (humano o LLM) tenga el contexto antes de editar.

## Requirements

- **Bun 1.3.10+** (para modo dev bare-metal; instalar desde [bun.sh](https://bun.sh)).
- **Docker** y **docker compose** (para modo producción en 4050).
- **Navegador moderno** con Web Audio (Chrome, Firefox, Safari, Edge — versión 2023+).
- **LAN** entre dispositivos para live-sync (no requiere internet).

## Author

<div align="center">

**[PumaSoft][pumasoft-link]**

</div>

## License

MIT © 2026 PumaSoft — see [LICENSE](LICENSE).

<!-- Reference-style definitions -->
[bun-badge]: https://img.shields.io/badge/Bun-1.3.10-fbf0df?style=flat-square&labelColor=0a0e14&logo=bun
[bun-link]: https://bun.sh
[ts-badge]: https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square&labelColor=0a0e14&logo=typescript
[ts-link]: https://www.typescriptlang.org
[docker-badge]: https://img.shields.io/badge/Docker-ready-2496ed?style=flat-square&labelColor=0a0e14&logo=docker
[docker-link]: #deployment
[webaudio-badge]: https://img.shields.io/badge/Web%20Audio-native-ff8c00?style=flat-square&labelColor=0a0e14
[webaudio-link]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
[license-badge]: https://img.shields.io/badge/license-MIT-a8d8a8?style=flat-square&labelColor=0a0e14
[pumasoft-badge]: https://img.shields.io/badge/by-PumaSoft-ff9f1c?style=flat-square&labelColor=0a0e14
[pumasoft-link]: https://github.com/felipesuarez-dev
