// Conversiones MIDI ↔ Hz. Convención: A4 = 69 = 440 Hz.

export function midiToHz(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function hzToMidi(hz: number): number {
  return Math.round(69 + 12 * Math.log2(hz / 440));
}
