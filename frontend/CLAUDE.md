# frontend/ — Reglas

Cliente HTML+CSS+TS. Bundleado por `Bun.build`, servido por el backend en `/bundle.js`.

## Reglas

- **Cero imports npm**. Sólo `./` y `../` relativos.
- **Cero frameworks**. Manipulación de DOM con `document.querySelector` y `addEventListener`. Web APIs nativas: Web Audio, Canvas, WebSocket, MediaRecorder, fetch.
- Capas (cada una sólo importa de capas inferiores o iguales):
  1. **`engine/`** — Web Audio puro. No conoce el DOM.
  2. **`dsl/`** — parser/builder, sólo TS puro. No conoce el DOM.
  3. **`ui/`** — DOM, eventos, render. Importa de engine y dsl.
  4. **`main.ts`** — bootstrap.
- Tipos compartidos en `types.ts`.

## Estructura

```
frontend/
├── index.html
├── styles.css
├── tsconfig.json
└── src/
    ├── main.ts
    ├── types.ts
    ├── engine/   → Web Audio: contexto, scheduler, master, track, drum, synth, voice, midi
    ├── dsl/      → notation, notes, scales, pattern, builder, eval
    └── ui/       → editor, grid, mixer, waveform, transport, i18n
```

## Cómo añadir un instrumento

1. Crea el módulo en `engine/<nombre>.ts` con la interfaz `Voice` (ver `voice.ts`).
2. Regístralo en `dsl/builder.ts` (caso del `.synth()` o `.drum()`).
3. Documenta en `docs/02-dsl-reference.md`.
