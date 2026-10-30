export type Health = {
  ok: boolean;
  version: string;
  commit: string;
  dev_mode: boolean;
  time: string;
  /** False while the data directory refuses writes; `store_error` says why (phase 17). */
  store_ok: boolean;
  store_error: string | null;
  /** Seconds since the kiosk's last heartbeat, -1 when none. */
  kiosk_heartbeat_age_s: number;
};

/** GET /healthz. Resolves to null on network or parse failure. */
export async function fetchHealth(fetchImpl: typeof fetch = fetch): Promise<Health | null> {
  try {
    const res = await fetchImpl("/healthz", { cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as Partial<Health>;
    if (typeof body.ok !== "boolean") return null;
    return {
      ok: body.ok,
      version: body.version ?? "",
      commit: body.commit ?? "",
      dev_mode: body.dev_mode ?? false,
      time: body.time ?? "",
      store_ok: body.store_ok !== false,
      store_error: typeof body.store_error === "string" ? body.store_error : null,
      kiosk_heartbeat_age_s: typeof body.kiosk_heartbeat_age_s === "number" ? body.kiosk_heartbeat_age_s : -1,
    };
  } catch {
    return null;
  }
}
