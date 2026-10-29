/**
 * Device credential handling (roadmap question 9). The box is started with
 * `?token=<CORELLIA_DEVICE_TOKEN>` once; the token is kept in localStorage
 * and sent as a bearer header on fetches and as `?token=` on the
 * EventSource (which cannot set headers). In dev mode (no token on the
 * server) nothing is sent.
 */
const KEY = "corellia.deviceToken";

let cached: string | null | undefined;

export function deviceToken(): string | null {
  if (cached !== undefined) return cached;
  cached = null;
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("token");
    if (fromUrl) {
      window.localStorage.setItem(KEY, fromUrl);
      cached = fromUrl;
    } else {
      cached = window.localStorage.getItem(KEY);
    }
  } catch {
    cached = null;
  }
  return cached;
}

/** For tests. */
export function resetDeviceTokenCache(): void {
  cached = undefined;
}

export function authHeaders(): Record<string, string> {
  const t = deviceToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export function withToken(url: string): string {
  const t = deviceToken();
  if (!t) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}token=${encodeURIComponent(t)}`;
}
