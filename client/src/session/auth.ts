/**
 * Device credential handling (roadmap question 9). The box is started with
 * `?token=<CORELLIA_DEVICE_TOKEN>` once; the token is kept in localStorage,
 * removed from the address bar, and sent as a bearer header on fetches and
 * as `?token=` on the EventSource (which cannot set headers). It can also
 * be typed into the token prompt when the server answers 401. In dev mode
 * (no token on the server) nothing is sent.
 */
const KEY = "corellia.deviceToken";

let cached: string | null | undefined;

export function deviceToken(): string | null {
  if (cached !== undefined) return cached;
  cached = null;
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("token");
    if (fromUrl) {
      window.localStorage.setItem(KEY, fromUrl);
      cached = fromUrl;
      stripTokenFromUrl(params);
    } else {
      cached = window.localStorage.getItem(KEY);
    }
  } catch {
    cached = null;
  }
  return cached;
}

/** Stores a token typed into the UI (empty clears it). */
export function setDeviceToken(token: string): void {
  const t = token.trim();
  cached = t || null;
  try {
    if (t) window.localStorage.setItem(KEY, t);
    else window.localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable: the token lives for this page only */
  }
}

function stripTokenFromUrl(params: URLSearchParams): void {
  params.delete("token");
  const rest = params.toString();
  const url = window.location.pathname + (rest ? `?${rest}` : "") + window.location.hash;
  window.history.replaceState(window.history.state, "", url);
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
