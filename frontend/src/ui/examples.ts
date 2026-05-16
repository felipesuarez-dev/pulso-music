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
    name: "🎮 Pokemon battle — completa con estructura (16 ciclos)",
    code:
`// Pokemon battle theme estilo Gen 1/2 (Game Boy).
// 10 pistas en LA menor a 150 BPM con estructura intro/verso/coro.
// Chiptune real: 2 canales pulse (square) + triangle bass + drum sintética.
pulso()
  .bpm(150)
  .songLength(16)

  // ─── INTRO 0–3: build de tensión ──────────────────────────
  .track('intro-kick').volume(0.7)
    .drum('kick').pattern('x.......x.......').during(0, 3)
  .track('intro-hat').volume(0.4)
    .drum('hat').pattern('x.x.x.x.x.x.x.x.').during(0, 3)
  .track('intro-bass').volume(0.85)
    .synth('square')
      .scale('Am')
      // Bajo de octavas tipo "anuncio" de batalla
      .notes('1 . 1, . 1 . 1, . 1 . 1, . 1 . 1, .')
      .filter(650).release(0.1).octave(2).during(0, 3)

  // ─── VERSO 4–11: tema principal ──────────────────────────
  .track('verso-drums')
    .drum('kick').pattern('x.x.x.x.x.x.x.x.').during(4, 11).volume(0.65)
    .drum('snare').pattern('....x.......x...').during(4, 11).volume(0.55)
    .drum('hat').pattern('..x...x...x...x.').during(4, 11).volume(0.35)
  .track('verso-bass').volume(0.9)
    .synth('square')
      .scale('Am')
      // Bajo bouncing tonic/quinta — patrón de pelea Gen 1
      .notes("1 . 5, 1 1 . 5, 1 b6 . b3 b6 b6 . b3 b6")
      .filter(700).release(0.1).octave(2).during(4, 11)
  .track('verso-lead').pan(0.4).volume(0.75)
    .synth('square')
      // Lead pulse — arpegio descendente Game Boy
      .scale('Am')
      .notes("1' b3' 5' 1'' 5' b3' 1' 5 1' b3' 5' 1'' 5' 4' b3' 2'")
      .filter(3500).release(0.08).during(4, 11)
  .track('verso-counter').pan(-0.4).volume(0.55)
    .synth('triangle')
      .scale('Am')
      // Contramelodía en triangle (canal CH3 del Game Boy)
      .notes("5 1' 5 b3' 5 1' 5 b3' b3 b6 b3 1' b3 b6 b3 1'")
      .filter(1500).release(0.15).octave(3).during(4, 11)

  // ─── CORO 12–15: explosión final ─────────────────────────
  .track('coro-drums')
    .drum('kick').pattern('x...x...x...x...').during(12, 15).volume(0.85)
    .drum('snare').pattern('..x...x...x...x.').during(12, 15).volume(0.65)
    .drum('hat').pattern('xxxxxxxxxxxxxxxx').during(12, 15).volume(0.4)
    .drum('clap').pattern('....x.......x...').during(12, 15).volume(0.55)
  .track('coro-bass').volume(0.95)
    .synth('square')
      .scale('Am')
      // Bajo más denso siguiendo la progresión Am-F-Dm-E
      .notes("1 1 1 1 b6 b6 b6 b6 4 4 4 4 5 5 5 5")
      .filter(800).release(0.12).octave(2).during(12, 15)
  .track('coro-lead-A').pan(0.4).volume(0.8)
    .synth('square')
      .scale('Am')
      // Lead A: arpegio ascendente épico
      .notes("5' 4' b3' 2' 1' 2' b3' 4' 5' b6' 5' 4' b3' 4' 5' 1''")
      .filter(3800).release(0.06).during(12, 15)
  .track('coro-lead-B').pan(-0.4).volume(0.6)
    .synth('square')
      .scale('Am')
      // Lead B: armoniza una sexta abajo
      .notes("b7 b6 5 4 b3 4 5 b6 b7 1' b7 b6 5 b6 b7 b3'")
      .filter(2800).release(0.06).during(12, 15)
  .track('coro-bell').pan(0).volume(0.5)
    .synth('triangle')
      .scale('Am')
      // Campana en agudos cada beat para acento épico
      .notes("1'' . . . 5' . . . 1'' . . . b7' . . .")
      .filter(3000).release(0.4).during(12, 15)
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
    id: "song-structure",
    name: "🎶 Canción completa — intro · verso · coro · break (16 ciclos)",
    code:
`// Canción con ESTRUCTURA real usando .during(start, end) por voz.
// 16 ciclos totales en DO menor, ~32 seg a 120 BPM:
//   ciclos  0–3:  INTRO  (sólo hat + pad respirando)
//   ciclos  4–7:  VERSO  (drums + bajo + lead suave)
//   ciclos  8–11: BREAK  (sólo bajo + clap esporádico — tensión)
//   ciclos 12–15: CORO   (todo el kit + lead pleno + strings)
pulso()
  .bpm(120)
  .songLength(16)

  // ─── INTRO 0–3 ────────────────────────────────────────────
  .track('intro-hat').volume(0.45)
    .drum('hat').pattern('x.x.x.x.x.x.x.x.').during(0, 3)
  .track('intro-pad').volume(0.55)
    .synth('sine')
      .scale('Cm')
      .notes('1 _ _ _ b6 _ _ _ b3 _ _ _ 5 _ _ _')
      .filter(1300).attack(0.5).release(1.4).during(0, 3)

  // ─── VERSO 4–7 ────────────────────────────────────────────
  .track('verso-drums')
    .drum('kick').pattern('x...x...x...x...').during(4, 7)
    .drum('snare').pattern('....x.......x...').during(4, 7).volume(0.5)
    .drum('hat').pattern('..x...x...x...x.').during(4, 7).volume(0.45)
  .track('verso-bajo').volume(0.85)
    .synth('sawtooth')
      .scale('Cm')
      .notes('1 1 5 1 b7 5 b3 5')
      .filter(420).release(0.2).octave(2).during(4, 7)
  .track('verso-lead').pan(0.3).volume(0.6)
    .synth('triangle')
      .scale('Cm')
      .notes("5 . b3 . 5 . 4 . b3 . 1 . 4 . 5 .")
      .filter(2400).release(0.3).during(4, 7)

  // ─── BREAK 8–11 (silencio dramático) ──────────────────────
  .track('break-bajo').volume(0.7)
    .synth('sine')
      .scale('Cm')
      .notes('1 _ _ _ _ _ _ _ b6 _ _ _ _ _ _ _')
      .filter(280).release(0.8).octave(2).during(8, 11)
  .track('break-clap').volume(0.6)
    .drum('clap').pattern('............x...').during(8, 11)
  .track('break-rim').volume(0.5)
    .drum('rim').pattern('x...x...x...x...').during(8, 11)

  // ─── CORO 12–15 (todo a tope) ─────────────────────────────
  .track('coro-drums')
    .drum('kick').pattern('x...x...x...x...').during(12, 15)
    .drum('snare').pattern('....x.......x...').during(12, 15)
    .drum('hat').pattern('xxxxxxxxxxxxxxxx').during(12, 15).volume(0.45)
    .drum('clap').pattern('....x.......x...').during(12, 15).volume(0.55)
    .drum('ride').pattern('x.......x.......').during(12, 15).volume(0.4)
  .track('coro-bajo').volume(0.95)
    .synth('sawtooth')
      .scale('Cm')
      .notes('1 1 1 1 b6 b6 b6 b6 b7 b7 b7 b7 5 5 5 5')
      .filter(500).release(0.18).octave(2).during(12, 15)
  .track('coro-lead').pan(0.4).volume(0.7)
    .synth('square')
      .scale('Cm')
      .notes("1' b3' 5' 4' b3' 1' b7 5 1' b3' 5' 1'' b7' 5' 4' b3'")
      .filter(2800).release(0.2).during(12, 15)
  .track('coro-strings').pan(-0.4).volume(0.65)
    .synth('sine')
      .scale('Cm')
      .notes('1 _ _ _ b6 _ _ _ b7 _ _ _ 5 _ _ _')
      .filter(1700).attack(0.2).release(1.5).during(12, 15)
  .play();
`,
  },
  {
    id: "cinematic-epic",
    name: "🎬 Cinematic épico (8 pistas, todos los drums)",
    code:
`// Epic cinematic en LA menor — 88 BPM solemne.
// 8 pistas. Showcase de los 10 drums + 4 capas de cuerdas/brass/coro.
// Progresión clásica épica: Am (i) → G (bVII) → F (bVI) → E (V).
pulso()
  .bpm(88)
  .track('foundation')
    .drum('kick').pattern('x.......x.......').volume(0.85)
    .drum('snare').pattern('....x.......x...').volume(0.5)
    .drum('tom').pattern('..............x.').volume(0.65)
  .track('cymbals').volume(0.55)
    .drum('ride').pattern('....x.......x...')
    .drum('shaker').pattern('x.x.x.x.x.x.x.x.')
  .track('tension').volume(0.45)
    .drum('rim').pattern('x.x.....x.x.....')
  .track('sub').volume(0.95)
    .synth('sine')
      .scale('Am')
      // Sub-bajo sostenido en la fundamental de cada acorde
      .notes('1 _ _ _ b7 _ _ _ b6 _ _ _ 5 _ _ _')
      .filter(180).release(0.8).octave(1)
  .track('strings').pan(-0.35).volume(0.6)
    .synth('sine')
      .scale('Am')
      // Cuerdas en octava alta — pad con attack lento
      .notes("1' _ _ _ b7 _ _ _ b6 _ _ _ 5 _ _ _")
      .filter(1400).attack(0.5).release(1.5)
  .track('brass').pan(0.35).volume(0.7)
    .synth('sawtooth')
      .scale('Am')
      // Contramelodía descendente: 5 4 b3 2 sobre los 4 acordes
      .notes("5 _ _ _ 4 _ _ _ b3 _ _ _ 2 _ _ _")
      .filter(1900).attack(0.1).release(0.6)
  .track('lead').pan(0).volume(0.75)
    .synth('triangle')
      .scale('Am')
      // Motivo épico ascendente y resolución
      .notes("5' 4' b3' 2' . b3' 4' 5' . 4' b3' 1' . 7 1' _")
      .filter(2800).attack(0.04).release(0.45)
  .track('choir').pan(0).volume(0.4)
    .synth('triangle')
      .scale('Am')
      // Coro alto sostenido — entra cada 2 ciclos (build de tensión)
      .notes("1'' _ _ _ b7' _ _ _ b6' _ _ _ 5' _ _ _")
      .every(2).filter(2200).attack(0.6).release(2.0)
  .play();
`,
  },
  {
    id: "salsa-caliente",
    name: "💃 Salsa caliente (percusión latina, 9 pistas)",
    code:
`// Salsa en RE menor — 108 BPM. Showcase de percusión latina con
// clave + cowbell + shaker + congas (tom) + rim + perc + kit.
// Tumbao de bajo + montuno de piano + brass stabs + lead melódico.
pulso()
  .bpm(108)
  .track('clave')
    // Clave son 2-3 (la base rítmica de toda la salsa)
    .drum('rim').pattern('..x...x...x.x...').volume(0.7)
  .track('cowbell')
    .drum('cowbell').pattern('x...x...x...x...').volume(0.55)
  .track('shaker').volume(0.5)
    // Shaker continuo en 8th notes
    .drum('shaker').pattern('x.x.x.x.x.x.x.x.')
  .track('congas').volume(0.7)
    // Conga: tom grave con perc complementario
    .drum('tom').pattern('..x...x.....x.x.')
    .drum('perc').pattern('....x.......x...').volume(0.55)
  .track('drum-kit').volume(0.65)
    .drum('kick').pattern('x...x...x...x...')
    .drum('snare').pattern('....x.......x...').volume(0.4)
  .track('bajo').volume(0.9)
    .synth('sine')
      .scale('Dm')
      // Tumbao: anticipación característica del bajo de salsa
      .notes('1 . . . 5 . 1, . . . 4 . 5 . 1 .')
      .filter(440).release(0.22).octave(2)
  .track('piano').pan(-0.35).volume(0.6)
    .synth('square')
      .scale('Dm')
      // Montuno: patrón sincopado clásico
      .notes("1 b3 5 1' b3 5 1 b3 4 b6 1' 4 5 b7 b3' 5")
      .filter(2200).release(0.18)
  .track('brass').pan(0.35).volume(0.7)
    .synth('sawtooth')
      .scale('Dm')
      // Brass stabs en off-beat, cada 2 ciclos para que respire
      .notes(". . 5' 1'' . . 4' b7' . . 5' 1'' . . 4' b7'")
      .every(2).filter(2400).attack(0.02).release(0.3)
  .track('lead').pan(0).volume(0.55)
    .synth('triangle')
      .scale('Dm')
      // Melodía tres cubano — entra cada 4 ciclos como solo
      .notes("5 b3 1 5 _ 4 b3 1 _ b3 5 1' _ b7 5 _")
      .every(4).filter(2800).release(0.4)
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
