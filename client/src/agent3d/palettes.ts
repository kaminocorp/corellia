import type { AgentState } from "../contract";

export type Vec3 = readonly [number, number, number];

/** Colour parameters for one agent state (fed to the nebula shaders as uniforms). */
export type Palette = {
  pearl: Vec3;
  tints: readonly [Vec3, Vec3, Vec3, Vec3];
  /** Mutually irrational cycle frequencies; see docs/refs/elephantasm-animation.md. */
  frequencies: readonly [number, number, number, number];
  intensities: readonly [number, number, number, number];
  spatialWeights: Vec3;
  /** CSS colour for the static fallback and the stats overlay. */
  css: string;
};

const GREEN: Vec3 = [0.45, 0.72, 0.5];
const CYAN: Vec3 = [0.4, 0.75, 0.78];
const VIOLET: Vec3 = [0.55, 0.45, 0.8];
const AMBER: Vec3 = [0.85, 0.65, 0.35];
const RED: Vec3 = [0.9, 0.3, 0.3];
const PEARL: Vec3 = [0.93, 0.91, 0.96];

export const PALETTES: Record<AgentState, Palette> = {
  idle: {
    pearl: [0.8, 0.8, 0.84],
    tints: [GREEN, CYAN, VIOLET, AMBER],
    frequencies: [0.037, 0.023, 0.043, 0.029],
    intensities: [0.22, 0.12, 0.1, 0.08],
    spatialWeights: [0.8, 0.6, 0.15],
    css: "hsl(142 71% 45%)",
  },
  listening: {
    pearl: PEARL,
    tints: [CYAN, GREEN, CYAN, VIOLET],
    frequencies: [0.09, 0.05, 0.07, 0.04],
    intensities: [0.45, 0.15, 0.25, 0.1],
    spatialWeights: [0.6, 0.9, 0.2],
    css: "hsl(189 94% 43%)",
  },
  thinking: {
    pearl: PEARL,
    tints: [AMBER, VIOLET, AMBER, GREEN],
    frequencies: [0.19, 0.13, 0.23, 0.11],
    intensities: [0.4, 0.3, 0.25, 0.1],
    spatialWeights: [1.2, 0.4, 0.3],
    css: "hsl(43 96% 56%)",
  },
  speaking: {
    pearl: PEARL,
    tints: [GREEN, GREEN, CYAN, AMBER],
    frequencies: [0.11, 0.07, 0.05, 0.03],
    intensities: [0.5, 0.25, 0.15, 0.1],
    spatialWeights: [0.8, 0.6, 0.15],
    css: "hsl(142 71% 45%)",
  },
  error: {
    pearl: [0.9, 0.8, 0.8],
    tints: [RED, AMBER, RED, VIOLET],
    frequencies: [0.3, 0.2, 0.25, 0.1],
    intensities: [0.6, 0.2, 0.3, 0.05],
    spatialWeights: [0.8, 0.6, 0.15],
    css: "hsl(0 84% 60%)",
  },
};
