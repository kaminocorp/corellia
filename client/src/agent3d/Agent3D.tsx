import { lazy, Suspense, useEffect, useRef, useState } from "react";

import type { AgentState } from "../contract";
import { PALETTES } from "./palettes";
import { renderStats } from "./stats";

const Nebula = lazy(() => import("./Nebula"));

/** True when the page can render the WebGL2 scene and the user allows motion. */
export function canRender3D(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    const c = document.createElement("canvas");
    return !!c.getContext("webgl2");
  } catch {
    return false;
  }
}

/** Static silhouette for reduced motion or no WebGL2: rings in the state colour. */
export function AgentFallback({ state }: { state: AgentState }) {
  const color = PALETTES[state].css;
  return (
    <svg viewBox="0 0 200 200" className="h-full max-h-[60vmin] w-full max-w-[60vmin]" role="img" aria-label={`agent ${state}`} data-testid="agent-fallback">
      {[90, 70, 50, 30].map((r, i) => (
        <circle key={r} cx={100} cy={100} r={r} fill="none" stroke={color} strokeOpacity={0.15 + i * 0.15} strokeWidth={1} />
      ))}
      <circle cx={100} cy={100} r={10} fill={color} fillOpacity={0.8} />
    </svg>
  );
}

type Props = {
  state: AgentState;
  /** Override particle counts (the `?particles=` flag). */
  particles?: number;
};

/**
 * The 3D agent: the persistent focal element (VISION 3). Keeps the state in
 * a ref so the scene never re-renders through React; falls back to a
 * static SVG when WebGL2 is unavailable or motion is reduced.
 */
export function Agent3D({ state, particles }: Props) {
  const stateRef = useRef<AgentState>(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  const [ok] = useState(() => canRender3D());
  if (!ok) return <AgentFallback state={state} />;
  const primary = particles ?? 12000;
  return (
    <Suspense fallback={<AgentFallback state={state} />}>
      <Nebula stateRef={stateRef} primaryCount={primary} coreCount={Math.round(primary / 10)} />
    </Suspense>
  );
}

/** `?stats=1`: fps, render scale, particle count, state. */
export function StatsOverlay() {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => tick((n) => n + 1), 500);
    return () => window.clearInterval(id);
  }, []);
  const s = renderStats;
  const text = `${s.renderer} · ${s.fps.toFixed(0)} fps · ${s.frameMs.toFixed(1)} ms · scale ${s.scale.toFixed(2)} · dpr ${s.dpr.toFixed(2)} · ${s.particles} pts · ${s.state}`;
  return <div className="absolute bottom-2 left-3 font-mono text-[0.65rem] text-muted-foreground">{text}</div>;
}
