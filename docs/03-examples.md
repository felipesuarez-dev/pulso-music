# 03 · Ejemplos progresivos

Cada bloque va de menos a más complejo. Pega cualquiera en el editor y pulsa `Ctrl+Enter`.

## 1. Hello kick

```ts
pulso()
  .bpm(120)
  .track('drums')
    .drum('kick').pattern('x...x...x...x...')
  .play();
```

## 2. Beat clásico de four-on-the-floor

```ts
pulso()
  .bpm(124)
  .track('drums')
    .drum('kick').pattern('x...x...x...x...')
    .drum('snare').pattern('....x.......x...')
    .drum('hat').pattern('x.x.x.x.x.x.x.x.')
  .play();
```

## 3. Bajo sencillo en escala

```ts
pulso()
  .bpm(110)
  .track('drums')
    .drum('kick').pattern('x...x...x...x...')
    .drum('snare').pattern('....x.......x...')
  .track('bass').volume(0.8)
    .synth('sawtooth')
      .scale('Am')
      .notes('1 1 5 1 b7 1 5 1')
      .filter(500).release(0.25)
  .play();
```

## 4. Notación latina (mismo bajo en solfeo)

```ts
pulso()
  .bpm(110)
  .track('bass')
    .synth('sawtooth')
      .notes('la2 la2 mi3 la2 sol2 la2 mi3 la2')
      .filter(500).release(0.25)
  .play();
```

## 5. Lead disperso con `.every(2)`

```ts
pulso()
  .bpm(120)
  .track('drums')
    .drum('kick').pattern('x...x...x...x...')
    .drum('hat').pattern('x.x.x.x.x.x.x.x.')
  .track('lead').pan(0.3).volume(0.6)
    .synth('triangle')
      .scale('Cm pent')
      .notes("1' . b3' 5' . 4' b3' 1'")
      .every(2).filter(2500).release(0.4)
  .play();
```

## 6. Tres pistas, mute con clic en el mixer

```ts
pulso()
  .bpm(124)
  .track('drums')
    .drum('kick').pattern('x...x...x...x...')
    .drum('snare').pattern('....x.......x...')
    .drum('hat').pattern('x.x.x.x.x.x.x.x.')
  .track('bass').volume(0.7)
    .synth('sawtooth')
      .scale('Cm')
      .notes('1 1 b3 5 b7 5 b3 1')
      .filter(450)
  .track('pad').pan(-0.4).volume(0.5)
    .synth('sine')
      .scale('Cm')
      .notes("1' b3' 5' b7' 5' b3' 1' .")
      .every(2).filter(1800).release(0.8)
  .play();
```

## 7. Blues en G

```ts
pulso()
  .bpm(96)
  .track('drums')
    .drum('kick').pattern('x...x...x...x...')
    .drum('snare').pattern('....x.......x...')
    .drum('hat').pattern('..x...x...x...x.')
  .track('bass').volume(0.8)
    .synth('triangle')
      .scale('G blues')
      .notes('1 b3 4 #4 5 b7 5 4')
      .filter(700)
  .play();
```

## 8. Progresión modal — dorian

```ts
pulso()
  .bpm(100)
  .track('drums')
    .drum('kick').pattern('x.......x.......')
    .drum('hat').pattern('..x...x...x...x.')
  .track('chords')
    .synth('square').volume(0.4)
      .scale('D dorian')
      .notes("1 . b3 . 5 . b7 . 1' . 5 . 4 . b3 .")
      .filter(1500).release(0.3)
  .play();
```

## 9. Variación con clap y solo

```ts
pulso()
  .bpm(128)
  .track('drums')
    .drum('kick').pattern('x...x...x...x...')
    .drum('snare').pattern('....x.......x...')
    .drum('hat').pattern('x.x.x.x.x.x.x.x.')
  .track('clap').volume(0.6)
    .drum('clap').pattern('................').every(4)
  .track('lead').pan(0.5).solo()
    .synth('sawtooth')
      .scale('Em pent')
      .notes("1 b3 4 5 b7 1' b7 5")
      .filter(2200)
  .play();
```

## 10. Patrón polirrítmico (16 vs 12)

```ts
pulso()
  .bpm(110)
  .track('drums')
    .drum('kick').pattern('x...x...x...x...')                 // 16 steps
    .drum('hat').pattern('x.x x.x x.x x.x.')                  // 16 con espacios
  .track('bell')
    .synth('triangle')
      .scale('C major')
      .notes("1 3 5 1' 3 5 1' 5 3 1 5 3")                    // 12 notas → desfase con el patrón
      .filter(3000).every(2)
  .play();
```
