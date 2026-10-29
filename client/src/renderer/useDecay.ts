import { useEffect } from "react";

import type { UISpec } from "../contract";

/**
 * Removes nodes whose `ttl_ms` has elapsed since they were last touched.
 * `touched` maps node id to the epoch ms of its last add/set.
 */
export function useDecay(spec: UISpec, touched: Record<string, number>, onExpire: (id: string) => void, now: () => number = Date.now) {
  useEffect(() => {
    const timers: number[] = [];
    for (const [id, n] of Object.entries(spec.nodes)) {
      if (n.ttl_ms === undefined) continue;
      const at = (touched[id] ?? now()) + n.ttl_ms;
      const delay = Math.max(0, at - now());
      timers.push(window.setTimeout(() => onExpire(id), delay));
    }
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [spec, touched, onExpire, now]);
}
