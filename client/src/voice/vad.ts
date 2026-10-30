/**
 * Energy voice-activity detection with an adaptive noise floor, a minimum
 * speech run, a silence hangover and a maximum utterance length. Pure:
 * feed it RMS levels with timestamps and it returns transitions.
 */
export type VadOptions = {
  /** Absolute RMS floor below which nothing counts as speech. */
  threshold?: number;
  /** Multiplier over the adaptive noise floor. */
  floorRatio?: number;
  minSpeechMs?: number;
  hangoverMs?: number;
  maxUtteranceMs?: number;
};

export type VadEvent = "start" | "end" | null;

export class EnergyVAD {
  state: "silence" | "speech" = "silence";
  private readonly threshold: number;
  private readonly floorRatio: number;
  private readonly minSpeechMs: number;
  private readonly hangoverMs: number;
  private readonly maxUtteranceMs: number;
  private floor = 0.005;
  private runStart: number | null = null;
  private speechStart = 0;
  private silenceStart: number | null = null;

  constructor(o: VadOptions = {}) {
    this.threshold = o.threshold ?? 0.02;
    this.floorRatio = o.floorRatio ?? 2.5;
    this.minSpeechMs = o.minSpeechMs ?? 120;
    this.hangoverMs = o.hangoverMs ?? 700;
    this.maxUtteranceMs = o.maxUtteranceMs ?? 15000;
  }

  /** The level above which input counts as speech right now. */
  get gate(): number {
    return Math.max(this.threshold, this.floor * this.floorRatio);
  }

  update(level: number, now: number): VadEvent {
    const loud = level >= this.gate;
    if (this.state === "silence") {
      if (!loud) {
        // Track the noise floor only while quiet.
        this.floor += (level - this.floor) * 0.05;
        this.runStart = null;
        return null;
      }
      if (this.runStart === null) this.runStart = now;
      if (now - this.runStart >= this.minSpeechMs) {
        this.state = "speech";
        this.speechStart = this.runStart;
        this.silenceStart = null;
        this.runStart = null;
        return "start";
      }
      return null;
    }
    // speech
    if (now - this.speechStart >= this.maxUtteranceMs) {
      this.state = "silence";
      return "end";
    }
    if (loud) {
      this.silenceStart = null;
      return null;
    }
    if (this.silenceStart === null) this.silenceStart = now;
    if (now - this.silenceStart >= this.hangoverMs) {
      this.state = "silence";
      return "end";
    }
    return null;
  }

  reset(): void {
    this.state = "silence";
    this.runStart = null;
    this.silenceStart = null;
  }
}

/** RMS of a float time-domain buffer. */
export function rms(samples: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
  return samples.length ? Math.sqrt(sum / samples.length) : 0;
}
