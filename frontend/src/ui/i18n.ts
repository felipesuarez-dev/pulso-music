import type { Lang } from "../types.ts";

const STR: Record<Lang, Record<string, string>> = {
  es: {
    play: "Tocar",
    stop: "Parar",
    evaluate: "Evaluar",
    metronome: "Metrónomo",
    volume: "Vol",
    bpm: "BPM",
    notation: "Notación",
    lang: "Idioma",
    examples: "Ejemplos",
    cheatsheet: "Cheatsheet del DSL",
    sequencer: "Sequencer (todas las voces)",
    exportMidi: "Export MIDI",
    save: "Guardar",
    load: "Cargar",
    delete: "Borrar",
    grid: "Grid del patrón",
    mixer: "Mixer",
    visualizer: "Visualizador",
    nowPlaying: "Próximas notas",
    hintEval: "Ctrl+Enter o \"Evaluar\" · Espacio = play/stop",
    gridHint: "Pon el cursor en una línea con .pattern(...)",
    ctxSuspended: "Toca cualquier botón para activar el audio",
    askName: "Nombre del patch:",
    confirmDelete: "¿Borrar este patch?",
    mute: "M",
    solo: "S",
  },
  en: {
    play: "Play",
    stop: "Stop",
    evaluate: "Evaluate",
    metronome: "Metronome",
    volume: "Vol",
    bpm: "BPM",
    notation: "Notation",
    lang: "Language",
    examples: "Examples",
    cheatsheet: "DSL cheatsheet",
    sequencer: "Sequencer (all voices)",
    exportMidi: "Export MIDI",
    save: "Save",
    load: "Load",
    delete: "Delete",
    grid: "Pattern grid",
    mixer: "Mixer",
    visualizer: "Visualizer",
    nowPlaying: "Upcoming notes",
    hintEval: "Ctrl+Enter or \"Evaluate\" · Space = play/stop",
    gridHint: "Place cursor on a line with .pattern(...)",
    ctxSuspended: "Tap any button to enable audio",
    askName: "Patch name:",
    confirmDelete: "Delete this patch?",
    mute: "M",
    solo: "S",
  },
};

let current: Lang = (localStorage.getItem("pulso.lang") as Lang) || "es";

export function getLang(): Lang { return current; }

export function setLang(l: Lang): void {
  current = l;
  localStorage.setItem("pulso.lang", l);
  applyI18n();
}

export function t(key: string): string {
  return STR[current][key] ?? key;
}

export function applyI18n(): void {
  const root = document;
  root.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
    const k = el.getAttribute("data-i18n");
    if (k) el.textContent = t(k);
  });
}
