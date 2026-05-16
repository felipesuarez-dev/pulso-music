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
// MI menor, 120 BPM. Progresión Em - C - G - D (i - VI - III - VII).
// Motivo del coro "Siete y media en la mañana": SI SI LA SOL · FA# SOL LA SI
//                                                 5  5  4  b3   2  b3 4  5  (en Em)
pulso()
  .bpm(120)
  .track('drums')
    .drum('kick').pattern('x...x...x...x...')
    .drum('snare').pattern('....x.......x...')
    .drum('hat').pattern('xxxxxxxxxxxxxxxx').volume(0.4)
    .drum('shaker').pattern('..x...x...x...x.').volume(0.5)
  .track('bajo').volume(0.95)
    .synth('square')
      .scale('Em')
      // Em (1) → C (b6) → G (b3) → D (b7): un beat por acorde, 4 acordes en el ciclo
      .notes('1 1 1 1 b6 b6 b6 b6 b3 b3 b3 b3 b7 b7 b7 b7')
      .filter(420).release(0.18).octave(2)
  .track('arp').pan(-0.45).volume(0.45)
    .synth('square')
      .scale('Em')
      // Arpegio que recorre la triada de cada acorde en su beat
      .notes("1 b3 5 b3 b6, 1 b3 1 b3 5 b7 5 b7 2 4 2")
      .filter(2100).release(0.12)
  .track('lead').pan(0.45).volume(0.75)
    .synth('triangle')
      .scale('Em')
      // Coro "Sie-te y me-dia... en la ma-ña-na" — 16 notas con respiraciones
      .notes("5 5 4 b3 _ . 2 b3 4 5 _ . 4 b3 1 _")
      .filter(2800).attack(0.02).release(0.4)
  .track('pad').pan(0).volume(0.35)
    .synth('sawtooth')
      .scale('Em')
      .notes("1 _ _ _ b6 _ _ _ b3 _ _ _ b7 _ _ _")
      .filter(1300).attack(0.4).release(1.4)
  .play();
`,
  },
  {
    id: "himno-chile",
    name: "🇨🇱 Himno Nacional de Chile (homenaje)",
    code:
`// Homenaje al Himno Nacional de Chile (Ramón Carnicer, 1828).
// Marcha solemne en DO mayor, 76 BPM. La frase del coro:
// "Dul-ce pa-tria, re-ci-be los vo-tos"
//   G  G  F  E  _  D  D  E  G  G  _  E
//   5  5  4  3  _  2  2  3  5  5  _  3
pulso()
  .bpm(76)
  .track('marcha')
    .drum('kick').pattern('x...x...x...x...').volume(0.75)
    .drum('snare').pattern('..x...x...x...x.').volume(0.4)
    .drum('cowbell').pattern('....x.......x...').volume(0.25)
  .track('melodia').volume(0.9)
    .synth('triangle')
      .scale('DO mayor')
      // "Dul-ce pa-tria, re-ci-be los vo-tos" — coro reconocible
      .notes("5 5 4 3 _ 2 2 3 5 5 _ 3 _ _ _ _")
      .filter(2600).attack(0.04).release(0.55)
  .track('bajo').volume(0.85)
    .synth('triangle')
      .scale('DO mayor')
      // I - V - vi - I  (clásica progresión hymnal)
      .notes('1 _ _ _ 5 _ _ _ 6 _ _ _ 1 _ _ _')
      .filter(620).release(0.7).octave(2)
  .track('cuerdas').pan(-0.3).volume(0.55)
    .synth('sine')
      .scale('DO mayor')
      // Contramelodía estática que arma el acorde
      .notes("3 _ _ _ 7 _ _ _ 1' _ _ _ 3 _ _ _")
      .filter(1700).attack(0.3).release(1.4)
  .track('coro').pan(0.3).volume(0.55)
    .synth('triangle')
      .scale('DO mayor')
      .notes("1' _ _ _ 2' _ _ _ 3' _ _ _ 5 _ _ _")
      .filter(2000).attack(0.2).release(1.0)
  .play();
`,
  },
  {
    id: "pokemon-battle",
    name: "🎮 Pokemon battle (chiptune)",
    code:
`// Tema de batalla estilo Pokemon Gen 1/2 (Game Boy).
// Chiptune en LA menor, rápido y agresivo. Dos canales pulse + drum sintética.
pulso()
  .bpm(150)
  .track('drums')
    .drum('kick').pattern('x.x.x.x.x.x.x.x.').volume(0.6)
    .drum('snare').pattern('....x.......x...').volume(0.5)
    .drum('hat').pattern('..x...x...x...x.').volume(0.35)
  .track('bass').volume(0.85)
    .synth('square')
      .scale('Am')
      // Bajo bouncing tonic/quinta — patrón de pelea
      .notes("1 . 5, 1 1 . 5, 1 b6 . b3 b6 b6 . b3 b6")
      .filter(700).release(0.1).octave(2)
  .track('lead').pan(0.3).volume(0.7)
    .synth('square')
      .scale('Am')
      // Arpegio rápido tipo Gen 1
      .notes("1' b3' 5' 1'' 5' b3' 1' 5 1' b3' 5' 1'' 5' 4' b3' 2'")
      .filter(3500).release(0.08)
  .track('counter').pan(-0.3).volume(0.5)
    .synth('triangle')
      .scale('Am')
      // Bajo de triangle complementario
      .notes("1 5 1' 5 1 5 1' 5 b6 b3 b6 b3 b7 4 b7 4")
      .filter(1500).release(0.15).octave(3)
  .play();
`,
  },
  {
    id: "cueca-chilena",
    name: "🇨🇱 Cueca chilena (folk)",
    code:
`// Cueca: baile nacional chileno. Tempo enérgico, rasgueo y pandero.
// Aproximación con cowbell + percs + bajo simple + melodía guitarra.
pulso()
  .bpm(120)
  .track('rasgueo')
    .drum('shaker').pattern('xxxxxxxxxxxxxxxx').volume(0.55)
    .drum('cowbell').pattern('x..x..x.x..x..x.').volume(0.5)
  .track('palmas')
    .drum('clap').pattern('....x.......x...').volume(0.4)
  .track('bajo').volume(0.85)
    .synth('triangle')
      .scale('DO mayor')
      // Bajo tipo tumbao: tonic/dominante alternados
      .notes('1 . 5 . 1 . 5 . 4 . 1 . 5 . 1 .')
      .filter(700).release(0.25).octave(2)
  .track('guitarra').pan(-0.3).volume(0.7)
    .synth('triangle')
      .scale('DO mayor')
      // Melodía típica de cueca, salta entre tonic y dominante
      .notes("3 5 1' 5 3 5 1' 5 4 6 1' 6 5 3 1 3")
      .filter(2400).release(0.2)
  .track('floreo').pan(0.4).volume(0.55)
    .synth('square')
      .scale('DO mayor')
      .notes("5' . 3' . 5' . 1'' . 4' . 2' . 5' . 3' .")
      .every(2).filter(2800).release(0.18)
  .play();
`,
  },
  {
    id: "rock-anthem",
    name: "🤘 Rock anthem (power chords)",
    code:
`// Rock anthem en MI menor. Drum kit completo, bajo de octavas, guitarra distorsionada (saw filtrada).
pulso()
  .bpm(132)
  .track('drums')
    .drum('kick').pattern('x...x...x...x...')
    .drum('snare').pattern('....x.......x...')
    .drum('hat').pattern('x.x.x.x.x.x.x.x.').volume(0.5)
    .drum('ride').pattern('....x.......x...').volume(0.4)
  .track('crash')
    .drum('clap').pattern('x...............').volume(0.6)
  .track('bass').volume(0.9)
    .synth('sawtooth')
      .scale('Em')
      // Bajo en octavas alternadas — palanca rock típica
      .notes('1 1 1, 1 1 1 1, 1 4 4 4, 4 b6 b6 b6, b6')
      .filter(380).release(0.12).octave(2)
  .track('guitar').pan(-0.4).volume(0.7)
    .synth('sawtooth')
      .scale('Em')
      // Power chords (tónica + quinta + octava simulada en arpegio rápido)
      .notes("1 5 1' 1 5 1' 1 5 4 1' 4 1' 4 1' b6 1'")
      .filter(2200).release(0.18)
  .track('lead').pan(0.4).volume(0.55)
    .synth('sawtooth')
      .scale('Em pent')
      // Solo pentatónico
      .notes("5 b7 1' 5 b7 1' b3' 1' 5 4 1 b3 5 4 b3 1")
      .every(2).filter(3000).release(0.3)
  .play();
`,
  },
  {
    id: "lofi-hiphop",
    name: "🌊 Lo-fi hip hop (chill)",
    code:
`// Lo-fi hip hop slow. Pads cálidos, kick suave, bajo redondo, vinilo perc.
pulso()
  .bpm(76)
  .track('drums')
    .drum('kick').pattern('x.......x.......').volume(0.7)
    .drum('snare').pattern('....x.......x...').volume(0.45)
    .drum('hat').pattern('x.x.x.x.x.x.x.x.').volume(0.3)
    .drum('perc').pattern('..x.....x...x.x.').volume(0.35)
  .track('bass').volume(0.85)
    .synth('sine')
      .scale('Fm')
      // Bajo redondo, una nota por compás
      .notes('1 _ _ _ b7 _ _ _ b6 _ _ _ 5 _ _ _')
      .filter(280).release(0.6).octave(2)
  .track('chords').pan(-0.3).volume(0.5)
    .synth('triangle')
      .scale('Fm')
      // Pad caliente, sustains largos
      .notes("1 _ _ b3 _ _ 5 _ _ b7 _ _ 5 _ _ _")
      .filter(1100).attack(0.3).release(1.2)
  .track('melody').pan(0.3).volume(0.55)
    .synth('triangle')
      .scale('Fm pent')
      // Frase melódica jazzy con espacios
      .notes("1' . . b3' . 5' . . 4' . b3' 1' . . b7 .")
      .every(2).filter(2200).release(0.45)
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
