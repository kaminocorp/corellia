import { authHeaders } from "./auth";

/** What the server says back to a heartbeat (phase 17). */
export type HeartbeatStatus = {
  /** Seconds since the kiosk last checked in; -1 when none has since the backend started. */
  kioskAgeS: number;
  /** False while the data directory refuses writes (memory, reminders and transcript are being lost). */
  storeOk: boolean;
};

export type HeartbeatOptions = {
  intervalMs?: number;
  /** Which client this page is: the kiosk's heartbeats are tracked apart so a browser tab cannot hide a hung kiosk from the watchdog. */
  client?: "kiosk" | "browser";
  onStatus?: (s: HeartbeatStatus) => void;
  fetchImpl?: typeof fetch;
};

/**
 * Posts /api/heartbeat on an interval so the box watchdog knows the page is
 * alive, tagged with the client kind, and reports the server's answer: is a
 * kiosk connected, is the store healthy (review 2026-10-30 round 5).
 */
export function startHeartbeat(intervalOrOpts: number | HeartbeatOptions = 30_000, fetchArg?: typeof fetch): () => void {
  const opts: HeartbeatOptions = typeof intervalOrOpts === "number" ? { intervalMs: intervalOrOpts, fetchImpl: fetchArg } : intervalOrOpts;
  const fetchImpl = opts.fetchImpl ?? fetch;
  const intervalMs = opts.intervalMs ?? 30_000;
  const client = opts.client ?? "browser";
  const beat = () => {
    fetchImpl("/api/heartbeat", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ client }),
      keepalive: true,
    })
      .then(async (res) => {
        if (!res.ok || !opts.onStatus) return;
        const body = (await res.json().catch(() => null)) as { kiosk_heartbeat_age_s?: unknown; store_ok?: unknown } | null;
        if (!body) return;
        opts.onStatus({
          kioskAgeS: typeof body.kiosk_heartbeat_age_s === "number" ? body.kiosk_heartbeat_age_s : -1,
          storeOk: body.store_ok !== false,
        });
      })
      .catch(() => {});
  };
  beat();
  const id = window.setInterval(beat, intervalMs);
  return () => window.clearInterval(id);
}
