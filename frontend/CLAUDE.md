# frontend/ — Reglas

Cliente HTML+CSS+TS plano. Bundleado por `Bun.build`, servido por el backend en `/bundle.js?v=<mtime>`.

## Reglas

- **Cero imports npm**. Sólo `./` y `../` relativos.
- **Cero frameworks**. DOM con `document.querySelector` y `addEventListener`. Web APIs nativas: Web Audio, Canvas, WebSocket, MediaRecorder, fetch, localStorage.
- **Capas** (cada una sólo importa de capas inferiores o iguales):
  1. **`engine/`** — Web Audio puro. NO conoce el DOM.
  2. **`dsl/`** — parser/builder/lint, sólo TS puro. NO conoce el DOM.
  3. **`ui/`** — DOM, eventos, render. Importa de `engine` y `dsl`.
  4. **`main.ts`** — bootstrap. Envuelto en try/catch que pinta stack trace al `#boot-error` si algo falla.
- **Tipos compartidos** en `types.ts`.
- **Bootstrap order matters**: instancia componentes ANTES de cualquier `editor.setCode(...)` o callback que pueda dispararlos. Mira el comentario "ORDEN CRÍTICO" en `main.ts`.

## Estructura

```
frontend/
├── index.html               # shell: topbar + main layout + cheat drawer
├── styles.css               # tema oscuro, responsive 1100/600/380px
├── favicon.svg              # onda de pulso naranja
├── cursor-text.svg          # cursor I-beam naranja (visible en fondo oscuro)
├── tsconfig.json
└── src/
    ├── main.ts              # bootstrap; ensambla todo
    ├── types.ts             # SessionDef, TrackDef, VoiceDef, Notation, Lang
    │
    ├── engine/              # Web Audio (sin DOM)
    │   ├── context.ts       # AudioContext singleton + ensureRunning
    │   ├── scheduler.ts     # lookahead 100ms / poll 25ms + visibilitychange
    │   ├── master.ts        # bus master + AnalyserNode + setMasterVolume
    │   ├── track.ts         # bus por pista (gain + pan + analyser + mute/solo)
    │   ├── drum.ts          # 10 drums sintetizados
    │   ├── synth.ts         # oscilador + filtro + ADSR
    │   ├── voice.ts         # interfaz común Instrument
    │   ├── metronome.ts     # click en cada beat (0/4/8/12) con acento en downbeat
    │   ├── midi.ts          # encoder Standard MIDI File (formato 1)
    │   └── runtime.ts       # orquestador: scheduler + buses + .during/.songLength
    │
    ├── dsl/                 # TS puro (sin DOM)
    │   ├── builder.ts       # pulso().bpm().track().drum/synth.notes.scale.preset.during...play()
    │   ├── notes.ts         # midiToHz / hzToMidi
    │   ├── notation.ts      # parseNote/parseNotes/formatNote — anglo + latina
    │   ├── scales.ts        # 11 escalas con aliases bilingües + resolveDegrees
    │   ├── pattern.ts       # parse "x.x." → [true,false,true,false]
    │   ├── presets.ts       # 16 presets de instrumento (wave + filter + ADSR)
    │   ├── lint.ts          # linter regex-based (typos, balance, rangos)
    │   └── eval.ts          # new Function('pulso', ...) sandbox + extrae línea de error
    │
    └── ui/                  # DOM + eventos
        ├── editor.ts        # textarea + gutter + overlay highlights + jumpToLine
        ├── grid.ts          # grid 16-step clickeable, drag-to-paint
        ├── mixer.ts         # sliders vol/pan + botones mute/solo por pista
        ├── sequencer.ts     # vista tracker: filas=voces, columnas=steps
        ├── waveform.ts      # Canvas waveform + spectrum (30fps throttled)
        ├── transport.ts     # play/stop/eval/tap-tempo/export-midi + onStateChange
        ├── i18n.ts          # diccionario es/en + t(key) + applyI18n
        ├── examples.ts      # catálogo de patches listos para tocar
        └── patches.ts       # cliente REST de /api/patches
```

## Cómo añadir un drum nuevo

1. En `engine/drum.ts`: define la función `nombre({ when, destination })` que conecta osciladores/noise al destination con un envelope corto.
2. Agrega el case en el switch de `makeDrum(kind)`.
3. Extiende `DrumKind` en `types.ts`.
4. Agrega el nombre al set `KNOWN_DRUMS` en `dsl/lint.ts` (para que typos disparen aviso).
5. Documéntalo en el drawer `index.html` → sección "🥁 Drums" con un `<code title="...">.drum('nombre')</code>`.

## Cómo añadir un preset de instrumento

1. En `dsl/presets.ts`: agrega entry al map `PRESETS` con `{ wave, filter, attack, decay, sustain, release, description }`.
2. Extiende el union `PresetName`.
3. Agrega el nombre al set `KNOWN_PRESETS` en `dsl/lint.ts`.
4. Agrega un `<code title="...">.preset('nombre')</code>` en la sección "🎼 Presets de instrumento" del drawer.

## Cómo añadir un ejemplo

1. En `ui/examples.ts`: nuevo objeto `{ id, name, code }`.
2. Valida con `/tmp/pulso-eval-all.ts` que evalúa limpio (sin errores de lint ni runtime).
3. Para examples con estructura de canción usa `.during(start, end)` + `.songLength(N)`.

## Highlight de líneas en vivo (verde mientras suena)

- `main.ts` tiene `findFiringLines(code, step)` que escanea el código con regex para encontrar líneas `.pattern()` con `x` en el step actual o `.notes()` con nota nueva (no `_` o `.`).
- `editor.setPlayingLines(Set<number>)` pinta el overlay (verde translúcido sobre la línea + borde lateral) + marca el gutter (verde negrita).
- Se limpia automáticamente al detener via `transport.onStateChange`.

## Reglas de estilo y CSS

- Cursor del textarea: SVG custom (`/cursor-text.svg`) naranja con outline negro. NO confiar en el cursor del SO (negro sobre fondo negro = invisible).
- Animaciones: usar `opacity` o `transform`, NO `box-shadow` (causa repaint del entorno y flicker).
- Visualizer: throttled a 30fps con `contain: strict` y `pointer-events: none` (no interfiere con el cursor).
- Topbar: el `#step-text` tiene `min-width` fijo + `tabular-nums` para evitar reflow al cambiar de "listo" a "16/16".
- Mobile breakpoints: 1100px (columna única) y 600px (compacto). Touch targets ≥ 36px en topbar, ≥ 44px en grid celdas.

## Linter / errores

- `dsl/lint.ts` corre en cada keystroke (debounced 250ms) + antes de cada eval.
- Si hay **errors** (no warnings) en el lint → eval se SALTA y playback se PARA (`transport.pauseIfPlaying()`) + cursor salta a la primera línea con error (`editor.jumpToLine`).
- Warnings (rangos numéricos fuera de límite) se muestran pero NO paran nada.
- El `eval.ts` extrae `<anonymous>:LINE:COL` del stack trace y resta 1 (por la línea de `"use strict";` que envuelve el código del usuario).
