# 07 · Multi-pistas y export MIDI / GBA

## Pistas como agrupación

Cada pista es un grupo de voces que comparten un bus de audio (volumen + pan + mute/solo + analyser propio). El mixer en la UI muestra un slider por pista.

```ts
pulso()
  .bpm(120)
  .track('drums')                       // pista 1
    .drum('kick').pattern('x...x...x...x...')
    .drum('snare').pattern('....x.......x...')
  .track('bass').volume(0.7).pan(-0.2)  // pista 2
    .synth('sawtooth').scale('Cm').notes('1 5 b7 1')
  .track('lead').pan(0.4)               // pista 3
    .synth('triangle').scale('Cm pent').notes("1' 3' 5' 4'")
  .play();
```

El mixer muestra:

```
drums  [▮▮▮▮▮▮▮▮▮▮]   pan C   [M] [S]
bass   [▮▮▮▮▮▮▮     ]  pan L20  [M] [S]
lead   [▮▮▮▮▮▮▮▮▮▮]   pan R40  [M] [S]
```

## Mute y solo

- **M** silencia la pista.
- **S** la pone en *solo*. Si alguna pista está en solo, todas las demás suenan en silencio mientras dure.

## Volumen y pan

Los sliders del mixer modifican el `SessionDef` activo en caliente. La próxima vez que ejecutes (`Ctrl+Enter`) los valores en el código sobrescriben los del mixer.

## Export a MIDI

Pulsa **Export MIDI** (arriba a la derecha). Se descarga `pulso.mid`:

- **Formato**: Standard MIDI File (SMF) formato 1, multi-track.
- **División**: 480 ticks por negra.
- **Tempo**: el `bpm` actual va en una *meta-track* inicial.
- **Pistas**: una pista MIDI por cada `.track()` del DSL, con su nombre como meta-evento.
- **Volumen y pan**: emitidos como Control Changes (CC#7 y CC#10).
- **Notas drum**: mapeadas a la convención General MIDI (kick=36, snare=38, hat=42, clap=39).
- **Duración exportada**: 4 ciclos = 16 beats. Editable en `frontend/src/engine/midi.ts` (constante `CYCLES_TO_EXPORT`).

## Importar en un DAW

Probado mentalmente con:

| DAW | Cómo importar |
| --- | --- |
| **Reaper** | Arrastra el `.mid` al timeline. Cada pista MIDI se crea como track separada. |
| **Ableton Live** | File → Import MIDI. |
| **Logic Pro** | File → Import → MIDI File. |
| **MuseScore** | File → Open → selecciona `.mid`. Se cuantiza a partitura. |
| **GarageBand** | Arrastra al canvas. |

## Workflow GBA

El GameBoy Advance no reproduce MIDI nativamente; reproduce **tracker** (`.MOD`, `.XM`, `.S3M`) compilado en la ROM con un motor como **MaxMod** (parte de devkitARM/libtonc) o **Krawall**.

MIDI es el puente. Pasos:

1. **Exporta MIDI desde Pulso** (`pulso.mid`).
2. **Convierte MIDI → tracker** con OpenMPT (gratis, multi-plataforma):
   - Abre OpenMPT → File → Import → `pulso.mid`.
   - Asigna instrumentos (samples cortos para encajar en el ROM size del GBA).
   - File → Save As → elige `.xm` o `.s3m`.
3. **Compílalo con MaxMod** en tu ROM:
   ```bash
   mmutil pulso.xm -opulso.bin -hpulso.h
   ```
4. En tu juego/demo carga el módulo:
   ```c
   mmInitDefault((mm_addr)pulso_bin, 8);
   mmStart(MOD_PULSO, MM_PLAY_LOOP);
   ```

> **Por qué no exportar tracker directo desde Pulso**: porque MOD/XM requieren samples PCM embebidos. Pulso no tiene samples (todo se sintetiza con osciladores). Generarlos al vuelo y empaquetarlos en formato tracker es 10× más código que el encoder MIDI y duplica trabajo que ya hacen mejor OpenMPT y MilkyTracker. Mantenemos Pulso ligero y delegamos esa conversión a herramientas estándar.

## Otros usos del MIDI exportado

- **TiMidity++** o **FluidSynth** lo reproducen con SoundFonts.
- **MuseScore** lo convierte a partitura PDF.
- **Cualquier hardware con MIDI in** (sintetizadores, módulos) lo toca.
- **mGBA** y otros emuladores GBA con plugins MIDI también pueden reproducirlo.
