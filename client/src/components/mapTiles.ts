/**
 * OpenStreetMap raster tiles for the Map component, and the check that
 * tells a real map from the tile server's refusal.
 *
 * OSM's tile policy asks heavy or anonymous clients to identify
 * themselves (a Referer and a User-Agent) and, when it refuses one, it
 * serves an "Access blocked" PNG with HTTP 200 (review 2026-10-30 round
 * 3). MapLibre would draw that notice as the map and never fall back. The
 * block response is recognisable from a browser without any exposed
 * header: it is sent with `Cache-Control: no-cache` (real tiles carry a
 * `max-age`), and its body is one fixed image, whose SHA-256 is below.
 */
export const TILE_URL_TEMPLATE = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
export const TILE_ATTRIBUTION = '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';

/** SHA-256 of the "Access blocked" tile OSM served on 2026-10-29 (6987 bytes). */
export const OSM_BLOCK_IMAGE_SHA256 = "b02c44252dac5a5e820ecef1e9bf9200e9407c042df668a466a1aa81a9ecca7a";

export const TILES_BLOCKED_MESSAGE = "The tile server refused this client (OpenStreetMap tile policy). Map tiles are unavailable until a keyed tile provider is configured.";

/** Slippy-map tile coordinates of a point at an integer zoom. */
export function tileCoords(lat: number, lng: number, zoom: number): { z: number; x: number; y: number } {
  const z = Math.max(0, Math.min(19, Math.floor(zoom)));
  const n = 2 ** z;
  const clampedLat = Math.max(-85.0511, Math.min(85.0511, lat));
  const x = Math.floor(((lng + 180) / 360) * n);
  const rad = (clampedLat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n);
  return { z, x: ((x % n) + n) % n, y: Math.max(0, Math.min(n - 1, y)) };
}

export function tileUrl(lat: number, lng: number, zoom: number): string {
  const { z, x, y } = tileCoords(lat, lng, zoom);
  return TILE_URL_TEMPLATE.replace("{z}", String(z)).replace("{x}", String(x)).replace("{y}", String(y));
}

export type TileProbe = { blocked: boolean; reason?: string };

export type ProbeDeps = {
  fetch: (url: string) => Promise<{ ok: boolean; headers: { get(name: string): string | null }; arrayBuffer(): Promise<ArrayBuffer> }>;
  /** SHA-256 of bytes as lowercase hex, or null when no digest is available (plain http). */
  sha256: (bytes: ArrayBuffer) => Promise<string | null>;
};

/**
 * Fetches one tile and says whether it is the block notice. A tile that
 * fails to load is not a verdict (offline for a moment, a 404): MapLibre
 * retries those and the map still shows.
 */
export async function probeTile(url: string, deps: ProbeDeps = defaultProbeDeps()): Promise<TileProbe> {
  let res: Awaited<ReturnType<ProbeDeps["fetch"]>>;
  try {
    res = await deps.fetch(url);
  } catch {
    return { blocked: false };
  }
  if (!res.ok) return { blocked: false };
  const cacheControl = (res.headers.get("cache-control") ?? "").toLowerCase();
  if (/\bno-cache\b/.test(cacheControl)) return { blocked: true, reason: TILES_BLOCKED_MESSAGE };
  try {
    const hash = await deps.sha256(await res.arrayBuffer());
    if (hash === OSM_BLOCK_IMAGE_SHA256) return { blocked: true, reason: TILES_BLOCKED_MESSAGE };
  } catch {
    /* unreadable body: no verdict */
  }
  return { blocked: false };
}

function defaultProbeDeps(): ProbeDeps {
  return {
    // Same URL and mode as MapLibre's own request, so the browser's cache answers it.
    fetch: (url) => fetch(url, { mode: "cors", credentials: "omit" }),
    sha256: async (bytes) => {
      const subtle = globalThis.crypto?.subtle;
      if (!subtle) return null; // plain http from another host: no SubtleCrypto
      const digest = await subtle.digest("SHA-256", bytes);
      return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
    },
  };
}
