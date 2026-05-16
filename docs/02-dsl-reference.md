# 02 · Referencia del DSL

Todo el DSL parte de la función `pulso()` y usa encadenamiento. Las llamadas devuelven `this`, así que puedes encadenar todo lo que quieras.

## Estructura general

```ts
pulso()
  .bpm(N)
  .track(name)            // cambia o crea pista
    .volume(v)            // método de pista
    .pan(p)               // método de pista
    .mute() / .solo()     // método de pista
    .drum(kind)           // crea nueva voz drum
    .synth(wave)          // crea nueva voz synth
      .pattern(s)         // método de voz
      .notes(s)           // método de voz
      .scale(s)           // método de voz
      .filter(hz)         // …
  .play();                // entrega la sesión al engine
```

Las llamadas de **pista** (`volume`, `pan`, `mute`, `solo`) operan sobre la pista actual. Las de **voz** (`pattern`, `notes`, `scale`, `filter`, `attack`, `decay`, `sustain`, `release`, `every`, `wave`, `octave`) operan sobre la voz actual (la última creada con `.drum()` o `.synth()`).

## Reloj

| Método | Tipo | Descripción |
| --- | --- | --- |
| `.bpm(n)` | `number` | Tempo. Default: 120. Rango: 20–400. |

## Pistas

| Método | Tipo | Descripción |
| --- | --- | --- |
| `.track(name)` | `string` | Activa o crea una pista con ese nombre. Las voces siguientes se añaden a ella. |
| `.volume(v)` | `0..1.5` | Volumen de la pista. Default 1. |
| `.pan(p)` | `-1..1` | Posición estéreo: -1 izq, 0 centro, 1 der. |
| `.mute()` | — | Silencia la pista. |
| `.solo()` | — | Solo: si alguna pista está en solo, las no-solo se silencian. |

## Voces — drums

```ts
.drum('kick' | 'snare' | 'hat' | 'clap')
```

Cada drum se sintetiza con osciladores y ruido. No hay samples.

## Voces — synth

```ts
.synth('sine' | 'square' | 'sawtooth' | 'triangle')
```

| Método | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `.wave(w)` | string | `'sine'` | Cambia la onda. |
| `.filter(hz)` | `number` | 8000 | Frecuencia de corte del lowpass. |
| `.attack(s)` | `number` | 0.005 | Tiempo de attack del envelope (segundos). |
| `.decay(s)` | `number` | 0.08 | Decay. |
| `.sustain(v)` | `0..1` | 0.6 | Nivel de sustain. |
| `.release(s)` | `number` | 0.2 | Release. |
| `.octave(n)` | `number` | 4 | Octava base para grados de escala. |

## Patrones rítmicos

```ts
.pattern('x.x.x.x.x.x.x.x.')   // 16 steps por defecto
```

- `x` = trigger
- `.` `_` `-` = silencio
- Los espacios se ignoran: `'x... x... x... x...'` ≡ `'x...x...x...x...'`
- Cualquier longitud funciona, pero 8/16/32 son las más naturales.

## Notas

```ts
.notes('do4 e4 sol4 c5')        // notación mezclada (latina + anglo)
.notes("1 b3 5 1' b7 4 ~ .")    // grados (requiere .scale antes)
```

**Tokens válidos:**
- Notas absolutas: `c4`, `C#4`, `Db4`, `do4`, `DO#4`, `reb4`, `SI4`. Octava por defecto: 4.
- `_` — sustain (no retriggera).
- `.` o `~` — silencio.
- Grados: `1`–`7`+; `b1`, `#3`, `bb7`, `##5`; `1'` sube octava, `1,` baja.

**Reglas de combinación:**
- Si declaras `.pattern()` Y `.notes()` en una voz `synth`: el patrón decide *cuándo* (qué steps suenan) y `.notes` se cicla por cada `x`.
- Si sólo declaras `.notes()`: una nota por step de la cadena.

## Escalas

```ts
.scale('Cm pentatonic')        // anglo
.scale('DO menor pentatónica') // latina
.scale('Bbm dorian')           // mezclas válidas también
```

11 escalas reconocidas: `major`, `minor`, `harmonicMinor`, `pentatonicMin`, `pentatonicMaj`, `blues`, `dorian`, `mixolydian`, `phrygian`, `lydian`, `chromatic`. Aliases bilingües soportados.

## `.every(n)`

```ts
.every(2)   // esta voz suena 1 de cada 2 ciclos
.every(4)   // 1 de cada 4 ciclos
```

Útil para variaciones (un *fill* cada 4 compases, un *lead* esporádico).

## Ejemplo completo

```ts
pulso()
  .bpm(110)
  .track('drums')
    .drum('kick').pattern('x.....x...x.....')
    .drum('snare').pattern('....x.......x...')
    .drum('hat').pattern('x.x.x.x.x.x.x.x.')
    .drum('clap').pattern('................').every(4)
  .track('bass').volume(0.8)
    .synth('sawtooth')
      .scale('Cm')
      .notes("1 1 5 1 b7 b6 5 1")
      .filter(450).release(0.2)
  .track('lead').pan(0.4)
    .synth('triangle')
      .scale('Cm pent')
      .notes("1' . b3' 5' . 4' b3' 1'")
      .every(2).filter(2500)
  .play();
```
