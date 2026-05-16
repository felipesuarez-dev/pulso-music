// Orquesta la sesión: scheduler + buses por pista + disparo de voces.
// Sin DOM. La UI consulta vía listeners y mute/solo.

import type { SessionDef, VoiceDef } from "../types.ts";
import { Scheduler } from "./scheduler.ts";
import { TrackBus } from "./track.ts";
import { makeDrum } from "./drum.ts";
import { makeSynth } from "./synth.ts";
import { shouldPlayCycle } from "./voice.ts";

export type StepListener = (step: number, cycle: number) => void;

export class Runtime {
  private scheduler = new Scheduler();
  private buses = new Map<string, TrackBus>();
  private session: SessionDef | null = null;
  private listeners = new Set<StepListener>();

  setSession(session: SessionDef): void {
    this.session = session;
    this.scheduler.setBpm(session.bpm);
    this.syncBuses();
  }

  getSession(): SessionDef | null {
    return this.session;
  }

  play(): void {
    if (!this.session) return;
    this.scheduler.start((time, step, cycle) => this.onTick(time, step, cycle));
  }

  stop(): void {
    this.scheduler.stop();
  }

  isRunning(): boolean {
    return this.scheduler.isRunning();
  }

  onStep(cb: StepListener): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  setVolume(name: string, v: number): void {
    const bus = this.buses.get(name);
    if (!bus) return;
    bus.setVolume(v);
    if (this.session) {
      const t = this.session.tracks.find((t) => t.name === name);
      if (t) t.volume = v;
    }
  }

  setPan(name: string, p: number): void {
    const bus = this.buses.get(name);
    if (!bus) return;
    bus.setPan(p);
    if (this.session) {
      const t = this.session.tracks.find((t) => t.name === name);
      if (t) t.pan = p;
    }
  }

  setMute(name: string, muted: boolean): void {
    const bus = this.buses.get(name);
    if (!bus) return;
    bus.muted = muted;
    if (this.session) {
      const t = this.session.tracks.find((t) => t.name === name);
      if (t) t.muted = muted;
    }
    this.applyMuteSolo();
  }

  setSolo(name: string, soloed: boolean): void {
    const bus = this.buses.get(name);
    if (!bus) return;
    bus.soloed = soloed;
    if (this.session) {
      const t = this.session.tracks.find((t) => t.name === name);
      if (t) t.soloed = soloed;
    }
    this.applyMuteSolo();
  }

  getBus(name: string): TrackBus | undefined {
    return this.buses.get(name);
  }

  private syncBuses(): void {
    if (!this.session) return;
    for (const t of this.session.tracks) {
      let bus = this.buses.get(t.name);
      if (!bus) {
        bus = new TrackBus(t.name);
        this.buses.set(t.name, bus);
      }
      bus.setVolume(t.volume);
      bus.setPan(t.pan);
      bus.muted = t.muted;
      bus.soloed = t.soloed;
    }
    this.applyMuteSolo();
  }

  private applyMuteSolo(): void {
    const anySolo = [...this.buses.values()].some((b) => b.soloed);
    for (const b of this.buses.values()) {
      const effective = anySolo ? !b.soloed : b.muted;
      b.applyMute(effective);
    }
  }

  private onTick(time: number, step: number, cycle: number): void {
    if (!this.session) return;
    for (const t of this.session.tracks) {
      const bus = this.buses.get(t.name);
      if (!bus) continue;
      for (const v of t.voices) {
        if (!shouldPlayCycle(v, cycle)) continue;
        if (v.kind === "drum") {
          if (v.pattern && v.pattern[step]) {
            makeDrum(v.drumKind ?? "kick").trigger({ when: time, destination: bus.input });
          }
        } else {
          const note = pickSynthNote(v, step);
          if (note >= 0) {
            makeSynth(v).trigger({ when: time, destination: bus.input, midi: note });
          }
        }
      }
    }
    this.listeners.forEach((l) => l(step, cycle));
  }
}

function pickSynthNote(v: VoiceDef, step: number): number {
  const notes = v.notes ?? [];
  if (notes.length === 0) return -2;
  if (v.pattern && v.pattern.length > 0) {
    if (!v.pattern[step]) return -2;
    let idx = 0;
    for (let i = 0; i < step; i++) if (v.pattern[i]) idx++;
    return notes[idx % notes.length] ?? -2;
  }
  // notes-only: una por step (cíclico). -1 (sustain) y -2 (rest) ya como tales.
  return notes[step % notes.length] ?? -2;
}
