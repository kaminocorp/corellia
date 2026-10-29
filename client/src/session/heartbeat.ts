import { authHeaders } from "./auth";

/** Posts /api/heartbeat on an interval so the box watchdog knows the page is alive. */
export function startHeartbeat(intervalMs = 30_000, fetchImpl: typeof fetch = fetch): () => void {
  const beat = () => {
    fetchImpl("/api/heartbeat", { method: "POST", headers: authHeaders(), keepalive: true }).catch(() => {});
  };
  beat();
  const id = window.setInterval(beat, intervalMs);
  return () => window.clearInterval(id);
}
