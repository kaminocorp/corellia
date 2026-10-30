/**
 * The speech audio level the 3D agent reacts to. The voice playback
 * (Phase 8) writes `level` from an AnalyserNode; the scene reads it each
 * frame. A plain mutable object avoids React re-renders at audio rate.
 */
export const audioLevel = { value: 0 };

export function setAudioLevel(v: number): void {
  audioLevel.value = Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0;
}
