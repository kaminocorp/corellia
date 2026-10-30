import type { AgentState } from "../contract";
import { PALETTES, type Palette, type Vec3 } from "./palettes";


/** Shape and motion parameters the state machine eases between. */
export type MotionParams = {
  /** Scale of displaced positions toward/away from the origin (breathing). */
  coherence: number;
  lowAmp: number;
  midAmp: number;
  /** Radians per second around Y and X. */
  rotY: number;
  rotX: number;
  /** Alpha multiplier. */
  brightness: number;
  /** Breathing: amplitude and Hz. */
  breathAmp: number;
  breathHz: number;
};

export const TARGETS: Record<AgentState, MotionParams> = {
  idle: { coherence: 1.0, lowAmp: 0.42, midAmp: 0.16, rotY: 0.05, rotX: 0.02, brightness: 0.8, breathAmp: 0.04, breathHz: 0.12 },
  listening: { coherence: 1.08, lowAmp: 0.3, midAmp: 0.1, rotY: 0.02, rotX: 0.0, brightness: 1.0, breathAmp: 0.06, breathHz: 0.5 },
  thinking: { coherence: 0.9, lowAmp: 0.6, midAmp: 0.28, rotY: 0.35, rotX: 0.12, brightness: 1.0, breathAmp: 0.03, breathHz: 0.9 },
  speaking: { coherence: 1.05, lowAmp: 0.45, midAmp: 0.2, rotY: 0.1, rotX: 0.03, brightness: 1.15, breathAmp: 0.02, breathHz: 0.3 },
  error: { coherence: 0.8, lowAmp: 0.7, midAmp: 0.35, rotY: -0.2, rotX: 0.2, brightness: 1.0, breathAmp: 0.1, breathHz: 2.0 },
};

export const AGENT_STATES: readonly AgentState[] = ["idle", "listening", "thinking", "speaking", "error"];

/** Current blended values the scene reads each frame. */
export type Frame = MotionParams & {
  palette: Palette;
  /** Effective coherence including breathing and audio. */
  coherenceNow: number;
  audio: number;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

/**
 * Eases motion and colour parameters toward the targets of the current
 * state. `step(dt)` is called once per frame; `setAudioLevel` lets the
 * speech analyser (Phase 8) modulate the form while speaking.
 */
export class AgentStateMachine {
  private state: AgentState = "idle";
  private cur: MotionParams = { ...TARGETS.idle };
  private pal: Palette = { ...PALETTES.idle };
  private audio = 0;
  private audioSmoothed = 0;
  private t = 0;
  /** Seconds to get ~63% of the way to the target. */
  tau = 0.35;

  constructor(initial: AgentState = "idle") {
    this.transition(initial);
    this.cur = { ...TARGETS[initial] };
    this.pal = { ...PALETTES[initial] };
  }

  get current(): AgentState {
    return this.state;
  }

  transition(state: AgentState): void {
    if (!AGENT_STATES.includes(state)) return;
    this.state = state;
  }

  /** 0..1 RMS-like level from the speech analyser. */
  setAudioLevel(level: number): void {
    this.audio = Math.max(0, Math.min(1, level));
  }

  step(dt: number): Frame {
    const dtc = Math.max(0, Math.min(0.1, dt));
    this.t += dtc;
    const k = 1 - Math.exp(-dtc / this.tau);
    const target = TARGETS[this.state];
    for (const key of Object.keys(this.cur) as (keyof MotionParams)[]) {
      this.cur[key] = lerp(this.cur[key], target[key], k);
    }
    const tp = PALETTES[this.state];
    this.pal = {
      pearl: lerp3(this.pal.pearl, tp.pearl, k),
      tints: [lerp3(this.pal.tints[0], tp.tints[0], k), lerp3(this.pal.tints[1], tp.tints[1], k), lerp3(this.pal.tints[2], tp.tints[2], k), lerp3(this.pal.tints[3], tp.tints[3], k)],
      frequencies: [lerp(this.pal.frequencies[0], tp.frequencies[0], k), lerp(this.pal.frequencies[1], tp.frequencies[1], k), lerp(this.pal.frequencies[2], tp.frequencies[2], k), lerp(this.pal.frequencies[3], tp.frequencies[3], k)],
      intensities: [lerp(this.pal.intensities[0], tp.intensities[0], k), lerp(this.pal.intensities[1], tp.intensities[1], k), lerp(this.pal.intensities[2], tp.intensities[2], k), lerp(this.pal.intensities[3], tp.intensities[3], k)],
      spatialWeights: lerp3(this.pal.spatialWeights, tp.spatialWeights, k),
      css: tp.css,
    };
    // Audio follows quickly up, decays slowly, and only matters while speaking.
    const audioTarget = this.state === "speaking" ? this.audio : 0;
    const ka = audioTarget > this.audioSmoothed ? 1 - Math.exp(-dtc / 0.05) : 1 - Math.exp(-dtc / 0.25);
    this.audioSmoothed = lerp(this.audioSmoothed, audioTarget, ka);
    const breath = Math.sin(this.t * Math.PI * 2 * this.cur.breathHz) * this.cur.breathAmp;
    return {
      ...this.cur,
      palette: this.pal,
      coherenceNow: this.cur.coherence + breath + this.audioSmoothed * 0.18,
      audio: this.audioSmoothed,
    };
  }
}
