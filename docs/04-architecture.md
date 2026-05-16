# 04 · Arquitectura

## Visión

```
Editor (textarea)
    │
    ▼
DSL eval ── new Function('pulso', code) ──► PulsoBuilder ─► SessionDef
                                                                 │
                                                                 ▼
                                                           Runtime.setSession
                                                                 │
                       ┌─────────────────────────────────────────┤
                       ▼                                         ▼
            Scheduler (lookahead 100ms)              TrackBus[] (gain/pan/analyser)
                       │                                         │
                       ▼                                         ▼
              onTick(time, step)              ────► makeDrum / makeSynth → triggers
                                                              │
                                                              ▼
                                                          Master bus → speakers
                                                              │
                                                              ▼
                                                          AnalyserNode → Canvas
```

## Capas

1. **`engine/`** — Web Audio puro. No conoce el DOM. Define `AudioContext`, `Scheduler`, `TrackBus`, `Master`, instrumentos, encoder MIDI y el `Runtime` que orquesta todo.
2. **`dsl/`** — TS puro sin DOM. Parser de notación, escalas, patterns, y el `PulsoBuilder` encadenable.
3. **`ui/`** — DOM, eventos, render. Usa engine y dsl.
4. **`main.ts`** — bootstrap: monta UI, conecta callbacks.

## Por qué scheduler con lookahead

`requestAnimationFrame` está atado al refresh rate y puede saltar. `setInterval` mismo es ruidoso. La solución estándar (Chris Wilson, 2013):

- Un `setInterval(25ms)` que mira `lookahead` segundos hacia adelante.
- Programa eventos en `audioContext.currentTime + offset` — el reloj de Web Audio es exacto al sample.
- Si la pestaña pasa a background y vuelve, reseteamos `nextTickAt` para no disparar una avalancha de eventos atrasados.

## Por qué cero npm

El registro de paquetes npm está comprometido (incidente confirmado por el operador del servidor). Usar `bun install` o `npm install` traería paquetes potencialmente con malware. La alternativa es escribirlo todo desde cero usando sólo:

- **Bun built-ins** (`Bun.serve`, `Bun.build`, `Bun.file`, `Bun.write`, `Bun.env`).
- **Web APIs estándar** (`AudioContext`, `Canvas`, `WebSocket`, `MediaRecorder`, `TextEncoder`, `localStorage`).

Funciona porque las APIs nativas cubren TODO lo que necesita un live coder.

## Por qué un `<textarea>` en lugar de Monaco/CodeMirror

Monaco y CodeMirror son paquetes npm. Imitarlos llevaría meses. Un `<textarea>` con CSS monoespaciado y atajos `Ctrl+Enter` / `Tab` cubre el 95% del valor de un editor de live coding sin coste de mantenimiento.

## Persistencia

Patches se guardan como JSON en `data/patches/`. El backend usa `Bun.write` y `Bun.file`. Sin base de datos.

## Contrato de tipos

Todo gira alrededor de tres tipos en `frontend/src/types.ts`:

- `VoiceDef` — una voz (drum o synth) con su patrón, notas y parámetros.
- `TrackDef` — agrupación de voces con volumen/pan/mute/solo.
- `SessionDef` — `{ bpm, tracks: TrackDef[] }`.

El `PulsoBuilder` produce un `SessionDef`. El `Runtime` lo consume. El `Mixer`, el `Visualizer` y el encoder MIDI lo leen. Una sola fuente de verdad.
