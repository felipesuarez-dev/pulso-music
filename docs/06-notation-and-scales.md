# 06 · Notación bilingüe y escalas

## Filosofía

Pulso entiende dos sistemas de nombres de notas y los acepta mezclados en cualquier `string`:

| Anglosajón | Latina / Solfeo |
| --- | --- |
| C | DO |
| D | RE |
| E | MI |
| F | FA |
| G | SOL |
| A | LA |
| B | SI |

Sostenidos: `C#` o `DO#`. Bemoles: `Db` o `REb`. Unicode válido: `♯`, `♭`.

## Selector de notación

En la barra superior tienes **Notación**: `C D E (anglo)` o `DO RE MI (latina)`. Esto cambia cómo Pulso **muestra** las notas en el panel "Próximas notas". Lo que **escribes** en el editor queda crudo (no se reescribe automáticamente).

## Octavas

- Por defecto, las notas se asumen en la octava 4 (donde `C4` = `DO4` = MIDI 60).
- Para indicar otra octava, sufija con un número: `c5`, `do5`, `f#3`, `LA2`.

## Tokens especiales

| Token | Significado |
| --- | --- |
| `_` | Sustain — no dispara nueva nota (continúa la previa). |
| `.` o `~` | Silencio — un step sin nota. |

```ts
.notes('c4 _ e4 g4 . c5 _ _')
```

## Escalas

`.scale(name)` configura la escala antes de declarar grados con `.notes`.

### Escalas reconocidas (alias bilingües)

| Alias | Intervalos (semitonos) |
| --- | --- |
| `major` / `mayor` / `M` | 0,2,4,5,7,9,11 |
| `minor` / `menor` / `m` | 0,2,3,5,7,8,10 |
| `harmonicMinor` / `armónica` | 0,2,3,5,7,8,11 |
| `pentatonicMin` / `pent` / `m pentatonic` | 0,3,5,7,10 |
| `pentatonicMaj` / `M pentatonic` | 0,2,4,7,9 |
| `blues` | 0,3,5,6,7,10 |
| `dorian` / `dórico` | 0,2,3,5,7,9,10 |
| `mixolydian` / `mixolidio` | 0,2,4,5,7,9,10 |
| `phrygian` / `frigio` | 0,1,3,5,7,8,10 |
| `lydian` / `lidio` | 0,2,4,6,7,9,11 |
| `chromatic` / `cromática` | 0,1,2,3,4,5,6,7,8,9,10,11 |

### Sintaxis de escala

```ts
.scale('Cm')                     // C menor (natural)
.scale('Cm pentatonic')          // C menor pentatónica
.scale('DO menor pentatónica')   // mismo en español
.scale('Bb dorian')              // Bb dorian
.scale('SOLm')                   // Sol menor
.scale('F# major')
```

## Grados

Una vez puesta la escala, `.notes` puede recibir grados en lugar de notas absolutas:

| Token | Significado |
| --- | --- |
| `1` | Tónica |
| `3` | Tercera de la escala |
| `b3` / `#3` | Tercera bemol / sostenida (alteración cromática) |
| `bb7` / `##5` | Doble alteración |
| `1'` | Tónica una octava arriba (puedes apilar: `1''`) |
| `1,` | Tónica una octava abajo (`1,,`) |
| `8` | Octava (= tónica una octava arriba) |
| `9` | Novena (= 2 una octava arriba), etc. |

```ts
.scale('Cm').notes("1 b3 5 1' b7 5 b3 1")
.scale('DO menor').notes("1 b3 5 1' b7 5 b3 1")   // idéntico
```

## Nota con un ejemplo paso a paso

```ts
pulso()
  .bpm(110)
  .track('bass')
    .synth('sawtooth')
      .scale('Am')                  // tónica La menor
      .notes("1 1 5 1 b7 1 5 1")    // tónica, quinta, séptima menor…
      .filter(500).release(0.25)
  .play();
```

Resolución interna:
- `Am` → tónica = pitch class 9 (A), intervalos `[0,2,3,5,7,8,10]`.
- Octava base default: 4 (puedes cambiarla con `.octave(3)`).
- `1` → A4 = MIDI 69.
- `5` → A4 + 7 semitonos = E5 = MIDI 76.
- `b7` → A4 + 10 - 0 = G5 = MIDI 79.
