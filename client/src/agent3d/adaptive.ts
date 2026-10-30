/**
 * Adaptive render resolution (roadmap question 7). Tracks a frame-time
 * EMA and moves the render scale (a fraction of the device pixel ratio)
 * down quickly when frames are slow and up slowly when there is headroom,
 * with hysteresis and a cooldown so it never oscillates.
 */
export type AdaptiveOptions = {
  minScale?: number;
  maxScale?: number;
  /** Frames slower than this (ms) push the scale down. Default 1000/30. */
  slowMs?: number;
  /** Frames faster than this (ms) allow the scale up. Default 1000/60 * 0.8. */
  fastMs?: number;
  step?: number;
  cooldownMs?: number;
  alpha?: number;
};

export class AdaptiveResolution {
  readonly min: number;
  readonly max: number;
  private readonly slowMs: number;
  private readonly fastMs: number;
  private readonly step: number;
  private readonly cooldownMs: number;
  private readonly alpha: number;
  private ema = 16.7;
  private sinceChange = 0;
  scale: number;

  constructor(o: AdaptiveOptions = {}) {
    this.min = o.minScale ?? 0.5;
    this.max = o.maxScale ?? 1;
    this.slowMs = o.slowMs ?? 1000 / 30;
    this.fastMs = o.fastMs ?? (1000 / 60) * 0.8;
    this.step = o.step ?? 0.1;
    this.cooldownMs = o.cooldownMs ?? 1500;
    this.alpha = o.alpha ?? 0.1;
    this.scale = this.max;
  }

  get frameMs(): number {
    return this.ema;
  }

  get fps(): number {
    return this.ema > 0 ? 1000 / this.ema : 0;
  }

  /** Feed one frame time in ms; returns true when the scale changed. */
  update(frameMs: number): boolean {
    if (!Number.isFinite(frameMs) || frameMs <= 0) return false;
    this.ema = this.ema + (Math.min(frameMs, 250) - this.ema) * this.alpha;
    this.sinceChange += frameMs;
    if (this.sinceChange < this.cooldownMs) return false;
    if (this.ema > this.slowMs && this.scale > this.min) {
      this.scale = Math.max(this.min, +(this.scale - this.step).toFixed(2));
      this.sinceChange = 0;
      return true;
    }
    if (this.ema < this.fastMs && this.scale < this.max) {
      this.scale = Math.min(this.max, +(this.scale + this.step / 2).toFixed(2));
      this.sinceChange = 0;
      return true;
    }
    return false;
  }
}
