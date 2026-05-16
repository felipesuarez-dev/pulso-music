// Catálogo de patches de ejemplo. Cada uno usa varias pistas para que
// suene como música de verdad, no como un metrónomo. Cargables al instante.

export interface Example {
  id: string;
  name: string;
  code: string;
}

export const EXAMPLES: Example[] = [
  {
    id: "house-deep",
    name: "Deep house — 5 pistas",
    code:
`pulso()
  .bpm(124)
  .track('drums')
    .drum('kick').pattern('x...x...x...x...')
    .drum('snare').pattern('....x.......x...').volume(0.7)
    .drum('clap').pattern('....x.......x...').volume(0.5)
  .track('hats').volume(0.5)
    .drum('hat').pattern('..x...x...x...x.')
  .track('bass').volume(0.85)
    .synth('sawtooth')
      .scale('Cm')
      .notes("1 1 5 1 b7 5 b3 5")
      .filter(420).release(0.18).octave(2)
  .track('pad').pan(-0.3).volume(0.55)
    .synth('triangle')
      .scale('Cm')
      .notes("1 b3 5 b7")
      .filter(1600).attack(0.2).release(1.0)
  .track('lead').pan(0.4).volume(0.6)
    .synth('triangle')
      .scale('Cm pent')
      .notes("1' . b3' 5' . 4' b3' 1'")
      .every(2).filter(2400).release(0.5)
  .play();
`,
  },
  {
    id: "synthwave",
    name: "Synthwave — drums + bass + arp + lead",
    code:
`pulso()
  .bpm(96)
  .track('drums')
    .drum('kick').pattern('x...x...x...x...')
    .drum('snare').pattern('....x.......x...')
    .drum('hat').pattern('..x...x...x...x.').volume(0.5)
  .track('bass').volume(0.8)
    .synth('sawtooth')
      .scale('Am')
      .notes('1 1 1 1 b6 b6 b6 b6 b7 b7 b7 b7 5 5 5 5')
      .filter(380).release(0.2).octave(2)
  .track('arp').pan(-0.4).volume(0.55)
    .synth('square')
      .scale('Am')
      .notes("1 b3 5 1' 5 b3 1 5,")
      .filter(2200).release(0.15)
  .track('lead').pan(0.4).volume(0.6)
    .synth('triangle')
      .scale('Am pent')
      .notes("1' b3' 4' 5' . 4' b3' 1'")
      .every(2).filter(3200).release(0.6)
  .play();
`,
  },
  {
    id: "trap",
    name: "Trap — 808 + hats picados + lead",
    code:
`pulso()
  .bpm(72)
  .track('drums')
    .drum('kick').pattern('x.......x...x...')
    .drum('snare').pattern('....x.......x...')
  .track('hats').volume(0.45)
    .drum('hat').pattern('xxxxxxxxxxxxxxxx')
  .track('808').volume(0.95)
    .synth('sine')
      .scale('Fm')
      .notes("1 . . . 1 . b7 . 1 . . . 5 . . .")
      .filter(160).release(0.7).octave(2)
  .track('lead').pan(0.3).volume(0.55)
    .synth('triangle')
      .scale('Fm pent')
      .notes("1' . b3' . 4' . 1' . b7 . 5 . 1' . . .")
      .every(2).filter(2800).release(0.4)
  .play();
`,
  },
  {
    id: "cumbia",
    name: "Cumbia — bajo + acordeón + güira",
    code:
`pulso()
  .bpm(96)
  .track('drums')
    .drum('kick').pattern('x...x...x...x...').volume(0.85)
    .drum('snare').pattern('....x.......x...').volume(0.6)
  .track('guira').volume(0.4)
    .drum('hat').pattern('x.xxx.xxx.xxx.xx')
  .track('bajo').volume(0.85)
    .synth('triangle')
      .scale('Am')
      .notes('1 . 5 . 1 . 5 . 4 . 1 . 5 . 1 .')
      .filter(700).release(0.25).octave(2)
  .track('acordeón').pan(-0.3).volume(0.65)
    .synth('square')
      .scale('Am')
      .notes("1 b3 5 1' 5 b3 1 5 4 b6 1' 4 1 b3 5 1")
      .filter(1800).release(0.18)
  .track('melodia').pan(0.4).volume(0.55)
    .synth('triangle')
      .scale('Am pent')
      .notes("1' . b3' 5' . 4' b3' 1'")
      .every(2).filter(2600).release(0.4)
  .play();
`,
  },
  {
    id: "dnb",
    name: "Drum & bass — break + sub + pad",
    code:
`pulso()
  .bpm(174)
  .track('drums')
    .drum('kick').pattern('x.......x.......')
    .drum('snare').pattern('....x.......x...')
    .drum('hat').pattern('x.x.x.x.x.x.x.x.').volume(0.45)
  .track('clap').volume(0.4)
    .drum('clap').pattern('....x...........').every(2)
  .track('sub').volume(0.95)
    .synth('sine')
      .scale('Em')
      .notes("1 . . . 1 . . . b7 . . . 5 . . .")
      .filter(140).release(0.6).octave(1)
  .track('pad').pan(-0.4).volume(0.5)
    .synth('triangle')
      .scale('Em')
      .notes("1 b3 5 b7")
      .filter(1500).attack(0.4).release(1.4)
  .track('stab').pan(0.4).volume(0.5)
    .synth('sawtooth')
      .scale('Em pent')
      .notes("1' . . b3' . 5' . 4' . . . 1' . b7 . .")
      .every(2).filter(2400).release(0.18)
  .play();
`,
  },
  {
    id: "tren-al-sur",
    name: "🇨🇱 Tren al Sur — Los Prisioneros (homenaje)",
    code:
`// Homenaje a 'Tren al Sur' (Los Prisioneros, 1990).
// Synth-pop en MI menor (Em). Progresión clásica: Em - DO - SOL - RE (i - VI - III - VII).
// El bajo machaca el tonic ochenta-style; el arp recorre el acorde; el lead canta el motivo.
pulso()
  .bpm(120)
  .track('drums')
    .drum('kick').pattern('x...x...x...x...')
    .drum('snare').pattern('....x.......x...')
    .drum('hat').pattern('xxxxxxxxxxxxxxxx').volume(0.4)
  .track('bajo').volume(0.9)
    .synth('square')
      .scale('Em')
      // Em (1) → C (b6) → G (b3) → D (b7) en grados de Em
      .notes('1 1 1 1 b6 b6 b6 b6 b3 b3 b3 b3 b7 b7 b7 b7')
      .filter(440).release(0.2).octave(2)
  .track('arp').pan(-0.4).volume(0.55)
    .synth('square')
      .scale('Em')
      // arpegio cíclico que sigue los cambios de acorde
      .notes("1 b3 5 b3 b6, 1 b3 1 b3 5 b7 5 b7 2 4 2")
      .filter(2100).release(0.12)
  .track('lead').pan(0.4).volume(0.7)
    .synth('triangle')
      .scale('Em')
      // motivo descendente del coro, con sostenidos para que respire
      .notes("5 5 b3 1 _ b3 4 5 _ 4 b3 1 _ b7 1 _")
      .filter(2500).attack(0.02).release(0.45)
  .track('pad').pan(0).volume(0.4)
    .synth('sawtooth')
      .scale('Em')
      .notes("1 _ _ _ b6 _ _ _ b3 _ _ _ b7 _ _ _")
      .filter(1400).attack(0.3).release(1.2)
  .play();
`,
  },
  {
    id: "himno-chile",
    name: "🇨🇱 Himno Nacional de Chile (homenaje)",
    code:
`// Homenaje al Himno Nacional de Chile (Ramón Carnicer, 1828).
// Marcha solemne en DO mayor — bombo en cada beat, melodía hymnal con
// frase "Puro Chile, es tu cielo azulado": SOL SOL MI DO — DO RE MI FA SOL — bajada a DO.
pulso()
  .bpm(72)
  .track('marcha')
    .drum('kick').pattern('x...x...x...x...').volume(0.7)
    .drum('snare').pattern('..x...x...x...x.').volume(0.35)
  .track('melodia').volume(0.85)
    .synth('triangle')
      .scale('DO mayor')
      // "Pu-ro Chi-le, es tu cie-lo a-zu-la-do"
      //   5  5  3  1   1  2  3  4  5  4  3  2  1  _  _  _
      .notes("5 5 3 1 _ 1 2 3 4 5 4 3 2 1 _ _")
      .filter(2400).attack(0.04).release(0.55)
  .track('bajo').volume(0.85)
    .synth('triangle')
      .scale('DO mayor')
      // I - V - IV - I (DO - SOL - FA - DO)
      .notes('1 _ _ _ 5 _ _ _ 4 _ _ _ 1 _ _ _')
      .filter(620).release(0.7).octave(2)
  .track('cuerdas').pan(-0.35).volume(0.6)
    .synth('sine')
      .scale('DO mayor')
      // Triada interna: 3 - 7 - 6 - 5 (movimiento por grados conjuntos)
      .notes("3 _ _ _ 7 _ _ _ 6 _ _ _ 5 _ _ _")
      .filter(1700).attack(0.3).release(1.4)
  .track('coro').pan(0.35).volume(0.5)
    .synth('triangle')
      .scale('DO mayor')
      .notes("1' _ _ _ 5 _ _ _ 6 _ _ _ 5 _ _ _")
      .filter(2000).attack(0.2).release(1.0)
  .play();
`,
  },
  {
    id: "latina-bossa",
    name: "Bossa latina — DO RE MI con 4 pistas",
    code:
`pulso()
  .bpm(98)
  .track('bateria')
    .drum('kick').pattern('x...x...x...x...').volume(0.7)
    .drum('snare').pattern('..x.x...x.x.x...').volume(0.45)
    .drum('hat').pattern('..x...x...x...x.').volume(0.4)
  .track('bajo').volume(0.85)
    .synth('triangle')
      .notes('do3 _ sol3 _ fa3 _ mi3 _ re3 _ sol3 _ do3 _ sol3 _')
      .filter(550).release(0.3)
  .track('piano').pan(-0.3).volume(0.6)
    .synth('square')
      .scale('DO mayor')
      .notes("1 3 5 1' 5 3 1 5 4 6 1' 4 1 3 5 1")
      .filter(1900).release(0.2)
  .track('melodia').pan(0.4).volume(0.6)
    .synth('triangle')
      .notes('mi5 _ re5 do5 _ si4 la4 sol4 _ la4 si4 _ do5 _ _ _')
      .filter(2800).release(0.5)
  .play();
`,
  },
];
