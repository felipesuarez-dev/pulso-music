// Catálogo de patches de ejemplo. Cargables al instante desde el dropdown.

export interface Example {
  id: string;
  name: string;
  code: string;
}

export const EXAMPLES: Example[] = [
  {
    id: "hello",
    name: "Hello beat (kick + snare)",
    code:
`pulso()
  .bpm(120)
  .track('drums')
    .drum('kick').pattern('x...x...x...x...')
    .drum('snare').pattern('....x.......x...')
  .play();
`,
  },
  {
    id: "house",
    name: "House — four on the floor",
    code:
`pulso()
  .bpm(124)
  .track('drums')
    .drum('kick').pattern('x...x...x...x...')
    .drum('snare').pattern('....x.......x...')
    .drum('hat').pattern('x.x.x.x.x.x.x.x.')
    .drum('clap').pattern('....x.......x...').volume(0.6)
  .track('bass').volume(0.7)
    .synth('sawtooth')
      .scale('Cm')
      .notes("1 1 5 1 b7 5 b3 5")
      .filter(450).release(0.18)
  .play();
`,
  },
  {
    id: "trap",
    name: "Trap — 808 + hats",
    code:
`pulso()
  .bpm(70)
  .track('drums')
    .drum('kick').pattern('x.......x.......')
    .drum('snare').pattern('....x.......x...')
    .drum('hat').pattern('xxxxxxxxxxxxxxxx').volume(0.4)
  .track('808').volume(0.9)
    .synth('sine')
      .scale('Fm')
      .notes("1 . . . 1 . b7 . 1 . . . 5 . . .")
      .filter(180).release(0.6).octave(2)
  .play();
`,
  },
  {
    id: "ambient",
    name: "Ambient — pad sin batería",
    code:
`pulso()
  .bpm(72)
  .track('pad').volume(0.55)
    .synth('triangle')
      .scale('Am')
      .notes("1 b3 5 b7")
      .filter(1400).attack(0.3).release(1.2)
  .track('bell').pan(0.4).volume(0.45)
    .synth('sine')
      .scale('Am pent')
      .notes("1' b3' 5' 1'' . b7' 5' b3'")
      .every(2).filter(3500).release(0.8)
  .play();
`,
  },
  {
    id: "latina",
    name: "Notación latina (DO RE MI)",
    code:
`pulso()
  .bpm(110)
  .track('drums')
    .drum('kick').pattern('x.......x.......')
    .drum('hat').pattern('..x...x...x...x.')
  .track('melodia').volume(0.7)
    .synth('triangle')
      .notes('do4 re4 mi4 fa4 sol4 la4 si4 do5')
      .filter(2000).release(0.3)
  .track('bajo').volume(0.7)
    .synth('sawtooth')
      .notes('do3 _ sol3 _ do3 _ sol3 _')
      .filter(420)
  .play();
`,
  },
  {
    id: "polyrithm",
    name: "Polirritmo (12 vs 16)",
    code:
`pulso()
  .bpm(108)
  .track('drums')
    .drum('kick').pattern('x...x...x...x...')
    .drum('hat').pattern('x.x.x.x.x.x.x.x.').volume(0.4)
  .track('bell')
    .synth('triangle')
      .scale('C major')
      .notes("1 3 5 1' 3' 5' 3' 1' 5 3 1 5")
      .filter(2800).release(0.25)
  .play();
`,
  },
];
