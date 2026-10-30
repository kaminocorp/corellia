import { SIMPLEX_NOISE_GLSL } from "./simplex-noise";

/**
 * Vertex shader for the swarm. Three internal phases:
 *   0 = drift  — particles meander near the previous formation
 *   1 = morph  — staggered+bent travel from previous to target (spans
 *                what the design brief calls "travel" and "settle")
 *   2 = hold   — at target with high-frequency micro-jitter
 *
 * Continuity at phase boundaries is preserved by carrying the drift
 * noise residual into the morph phase (fades out as `eased` rises),
 * so there's no visible snap when drift → morph kicks in.
 *
 * Per-particle attributes (set once at canvas mount):
 *   previousTarget    — where the particle came from (prior held shape)
 *   targetPosition    — where it's heading (current shape)
 *   morphSeed         — [0,1] random; staggers travel arrival
 *   trajectoryNoise   — unit vector; bend direction during travel
 *
 * Uniforms (CPU writes 3 per frame):
 *   uPhase           — int, 0/1/2
 *   uPhaseProgress   — float, 0..1 within current phase
 *   uTime            — seconds since canvas mount
 *   uPixelRatio      — devicePixelRatio for size scaling
 */
export const SWARM_VERTEX_SHADER = /* glsl */ `
attribute vec3 previousTarget;
attribute vec3 targetPosition;
attribute float morphSeed;
attribute vec3 trajectoryNoise;

uniform int uPhase;
uniform float uPhaseProgress;
uniform float uTime;
uniform float uPixelRatio;

varying float vAlpha;
varying float vSeed;

${SIMPLEX_NOISE_GLSL}

vec3 driftDisplacement(vec3 base, float t) {
  vec3 n = vec3(
    snoise(base * 0.5 + vec3(uTime * 0.12)),
    snoise(base * 0.5 + vec3(uTime * 0.10 + 30.0)),
    snoise(base * 0.5 + vec3(uTime * 0.14 + 60.0))
  );
  // Amplitude ramps over the drift phase so the formation dissolves
  // gradually rather than bursting at t=0.
  float amp = 0.05 + t * 0.35;
  return n * amp;
}

void main() {
  vec3 displaced;

  if (uPhase == 0) {
    // DRIFT — meander near the previous formation.
    displaced = previousTarget + driftDisplacement(previousTarget, uPhaseProgress);
  } else if (uPhase == 1) {
    // MORPH — staggered, bent travel from previous to target.
    float t = clamp((uPhaseProgress - morphSeed * 0.25) / 0.75, 0.0, 1.0);
    float eased = smoothstep(0.0, 1.0, t);
    vec3 straight = mix(previousTarget, targetPosition, eased);
    float bendStrength = sin(eased * 3.14159265);
    vec3 bent = straight + trajectoryNoise * bendStrength * 0.6;

    // Carry-over drift noise that fades as morph progresses, so the
    // drift→morph transition has no visible snap.
    vec3 carry = driftDisplacement(previousTarget, 1.0) * (1.0 - eased);
    displaced = bent + carry;
  } else {
    // HOLD — at target with high-frequency micro-jitter so the
    // formation reads as alive, not frozen.
    vec3 jitter = vec3(
      snoise(targetPosition * 8.0 + vec3(uTime * 0.7)),
      snoise(targetPosition * 8.0 + vec3(uTime * 0.6 + 10.0)),
      snoise(targetPosition * 8.0 + vec3(uTime * 0.8 + 20.0))
    );
    displaced = targetPosition + jitter * 0.015;
  }

  vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Distance-attenuated point size. Pinpricks (~3 px) at camera z=6;
  // density comes from particle count, not point footprint.
  gl_PointSize = 1.0 * uPixelRatio * (8.0 / -mvPosition.z);

  // Per-phase alpha. Smoothstep the morph-tail down to hold's level over
  // the last 14% of morph so the morph→hold boundary has no visible step
  // (which previously read as a brightness glitch right as the formation
  // arrived). Hold flickers gently to read as alive.
  float baseHold = 0.36;
  if (uPhase == 1) {
    float morphPeak = 0.50;
    float settle = smoothstep(0.86, 1.0, uPhaseProgress);
    vAlpha = mix(morphPeak, baseHold, settle);
  } else if (uPhase == 2) {
    float flicker = sin(uTime * 0.4 + morphSeed * 6.2831853) * 0.04;
    vAlpha = baseHold + flicker;
  } else {
    vAlpha = baseHold;
  }

  vSeed = morphSeed;
}
`;
