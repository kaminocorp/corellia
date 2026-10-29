export type Health = {
  ok: boolean;
  version: string;
  commit: string;
  dev_mode: boolean;
  time: string;
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
    };
  } catch {
    return null;
  }
}
