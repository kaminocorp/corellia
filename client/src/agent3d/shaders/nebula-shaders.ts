import { SIMPLEX_NOISE_GLSL } from "./simplex-noise";

/**
 * Nebula avatar shaders — adapted from `docs/refs/elephantasm-animation.md`,
 * downsized for a card-sized avatar (Phase 2 of agents-ui-mods).
 *
 * Two layers (vs the source's three; Wisp Tendrils dropped — too soft to
 * read at 240×240):
 *
 *   PrimaryCloud  — ~2.5K pts, Gaussian volume, 3-octave noise displacement,
 *                   pearl + 4-tint iridescent fragment.
 *   CoreMotes     — ~500 pts, tight Gaussian, high-freq jitter only,
 *                   warm/cool oscillation in the fragment.
 *
 * Per-harness divergence is *only* in the palette uniforms (decision 5);
 * every spatial / temporal constant is shared so the visual family stays
 * coherent across harnesses.
 *
 * The simplex noise function is imported from sign-in's shader bundle
 * because it is generic Ashima webgl-noise — not feature-specific. Lift to
 * `frontend/src/lib/shaders/` if a third caller arrives.
 */

/* -------------------- PrimaryCloud -------------------- */

export const PRIMARY_VERTEX_SHADER = /* glsl */ `
attribute float phase;
attribute float pSize;

uniform float uTime;
uniform float uLowAmp;
uniform float uMidAmp;
uniform float uCoherence;
uniform float uPixelRatio;

varying float vAlpha;
varying vec3 vDisplaced;
varying float vDepth;

${SIMPLEX_NOISE_GLSL}

void main() {
  vec3 bp = position;
  float t = uTime;

  // Low-frequency octave — large-scale form reshaping.
  vec3 low = vec3(
    snoise(bp * 0.8 + vec3(t * 0.12, t * 0.09, t * 0.07)),
    snoise(bp * 0.8 + vec3(t * 0.08 + 50.0, t * 0.11, t * 0.06)),
    snoise(bp * 0.8 + vec3(t * 0.10, t * 0.07 + 80.0, t * 0.13))
  );

  // Mid-frequency octave — medium-scale turbulence.
  vec3 mid = vec3(
    snoise(bp * 2.2 + vec3(t * 0.25, t * 0.20, t * 0.18)),
    snoise(bp * 2.2 + vec3(t * 0.22 + 30.0, t * 0.28, t * 0.15)),
    snoise(bp * 2.2 + vec3(t * 0.19, t * 0.23 + 60.0, t * 0.27))
  );

  // High-frequency octave — fine detail shimmer.
  vec3 high = vec3(
    snoise(bp * 6.0 + vec3(t * 0.50)),
    snoise(bp * 6.0 + vec3(t * 0.45 + 20.0)),
    snoise(bp * 6.0 + vec3(t * 0.55 + 40.0))
  );

  vec3 displaced = bp + low * uLowAmp + mid * uMidAmp + high * 0.035;
  displaced *= uCoherence;

  vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Density gradient: bright core fading to transparent edges, plus a dual
  // sine flicker keyed off per-particle phase so particles don't twinkle in
  // unison.
  float dist = length(displaced);
  float coreAlpha = smoothstep(1.8, 0.0, dist) * 0.55;
  float edgeAlpha = smoothstep(0.0, 1.4, dist) * 0.12;
  float flicker  = sin(t * 0.40 + phase) * 0.12
                 + sin(t * 0.17 + phase * 2.3) * 0.08;
  vAlpha = clamp(coreAlpha + edgeAlpha + flicker, 0.012, 0.65);

  vDisplaced = displaced;
  vDepth = -mvPosition.z;

  // Distance-attenuated point size; the per-particle pSize gives natural
  // size variance so the cloud reads as volumetric, not a uniform stipple.
  gl_PointSize = pSize * uPixelRatio * (1.6 / -mvPosition.z);
}
`;

export const PRIMARY_FRAGMENT_SHADER = /* glsl */ `
uniform float uTime;
uniform vec3 uPearl;
uniform vec3 uTint0;
uniform vec3 uTint1;
uniform vec3 uTint2;
uniform vec3 uTint3;
uniform vec4 uTintFreq;
uniform vec4 uTintIntensity;
uniform vec3 uSpatialWeights;

varying float vAlpha;
varying vec3 vDisplaced;
varying float vDepth;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float soft = exp(-d * d * 8.0);
  if (soft < 0.01) discard;

  // Spatial seed — position-dependent, not just time-dependent. Different
  // regions of the cloud shift through different hues simultaneously, so
  // the colour reads as flowing through the form rather than uniformly
  // pulsing.
  float spatial = vDisplaced.x * uSpatialWeights.x
                + vDisplaced.y * uSpatialWeights.y
                + vDepth       * uSpatialWeights.z;

  float moodA = sin(uTime * uTintFreq.x + spatial * 1.5      ) * 0.5 + 0.5;
  float moodB = sin(uTime * uTintFreq.y + spatial * 1.2 + 1.8) * 0.5 + 0.5;
  float moodC = sin(uTime * uTintFreq.z + spatial * 1.8 + 3.5) * 0.5 + 0.5;
  float moodD = sin(uTime * uTintFreq.w + spatial * 1.0 + 5.1) * 0.5 + 0.5;

  vec3 color = uPearl;
  color = mix(color, uTint0, moodA * uTintIntensity.x);
  color = mix(color, uTint1, moodB * uTintIntensity.y);
  color = mix(color, uTint2, moodC * uTintIntensity.z);
  color = mix(color, uTint3, moodD * uTintIntensity.w);

  gl_FragColor = vec4(color, vAlpha * soft);
}
`;

/* -------------------- CoreMotes -------------------- */

export const CORE_VERTEX_SHADER = /* glsl */ `
attribute float phase;

uniform float uTime;
uniform float uPixelRatio;

varying float vAlpha;
varying float vWarmCool;

${SIMPLEX_NOISE_GLSL}

void main() {
  vec3 bp = position;
  float t = uTime;

  // High-frequency micro-jitter only — buzzing, energetic core that
  // contrasts with the slow-moving primary cloud.
  vec3 jitter = vec3(
    snoise(bp * 8.0 + vec3(t * 0.80)),
    snoise(bp * 8.0 + vec3(t * 0.70 + 10.0)),
    snoise(bp * 8.0 + vec3(t * 0.90 + 20.0))
  );
  vec3 displaced = bp + jitter * 0.04;

  vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float flicker = sin(t * 0.45 + phase * 3.1) * 0.18;
  vAlpha = clamp(0.55 + flicker, 0.30, 0.85);

  // Slow warm/cool drift, per-particle phase-offset so the core breathes.
  vWarmCool = sin(t * 0.08 + phase) * 0.5 + 0.5;

  gl_PointSize = 2.2 * uPixelRatio;
}
`;

export const CORE_FRAGMENT_SHADER = /* glsl */ `
varying float vAlpha;
varying float vWarmCool;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float soft = exp(-d * d * 10.0);
  if (soft < 0.01) discard;

  vec3 warm = vec3(1.00, 0.88, 0.78);
  vec3 cool = vec3(0.82, 0.88, 1.00);
  vec3 color = mix(warm, cool, vWarmCool);

  gl_FragColor = vec4(color, vAlpha * soft);
}
`;
