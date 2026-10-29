/**
 * Fragment shader for the swarm — pearlescent silver palette.
 *
 * No literal hue cycle. Three near-white tones (warm pearl, neutral pearl,
 * cool platinum) are mixed by a slow per-particle phase so the swarm
 * reads as a pearlescent shimmer rather than a green→cyan rainbow.
 * `uCyanTint` (kept as the "in-flight" channel from the scheduler) shifts
 * the mix toward the brighter cool platinum during MORPH; outside MORPH
 * the swarm settles into a quieter warm pearl.
 *
 * Point softness via `exp(-d*d*8.0)`, discard at <0.01 to keep the
 * additive blend from haloing across half-transparent pixels.
 */
export const SWARM_FRAGMENT_SHADER = /* glsl */ `
uniform float uCyanTint;
uniform float uTime;

varying float vAlpha;
varying float vSeed;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float soft = exp(-d * d * 8.0);
  if (soft < 0.01) discard;

  // Three pearl tones — warm, neutral, cool. None saturated; the swarm
  // stays in the white/silver register no matter the mix.
  vec3 pearlWarm    = vec3(0.96, 0.94, 0.90);
  vec3 pearlNeutral = vec3(0.94, 0.95, 0.97);
  vec3 platinum     = vec3(0.86, 0.92, 1.00);

  // Slow per-particle shimmer phase: each particle's hue drifts on its
  // own clock, the swarm as a whole reads as iridescent rather than
  // monochrome. 0.35 Hz × 6.28 ≈ 2.2 rad/s — slow enough not to read as
  // flicker, fast enough to feel alive.
  float shimmer = 0.5 + 0.5 * sin(uTime * 0.35 + vSeed * 6.2831853);

  // At rest: cross-fade between warm and neutral by shimmer.
  vec3 rest = mix(pearlWarm, pearlNeutral, shimmer);
  // In flight: bias toward cool platinum, still modulated by shimmer.
  vec3 flight = mix(pearlNeutral, platinum, shimmer);

  vec3 color = mix(rest, flight, clamp(uCyanTint, 0.0, 1.0));

  gl_FragColor = vec4(color, vAlpha * soft);
}
`;
