import { describe, expect, it } from "vitest";

import { OSM_BLOCK_IMAGE_SHA256, probeTile, tileCoords, tileUrl, type ProbeDeps } from "./mapTiles";

function deps(over: { ok?: boolean; cacheControl?: string | null; hash?: string | null; throws?: boolean }): ProbeDeps {
  return {
    fetch: async () => {
      if (over.throws) throw new TypeError("Failed to fetch");
      return { ok: over.ok ?? true, headers: { get: (n: string) => (n === "cache-control" ? (over.cacheControl ?? null) : null) }, arrayBuffer: async () => new ArrayBuffer(8) };
    },
    sha256: async () => over.hash ?? "0000",
  };
}

describe("map tiles", () => {
  it("computes slippy tile coordinates", () => {
    // Lisbon at zoom 11, as the local runtime shows it.
    expect(tileCoords(38.7223, -9.1393, 11)).toEqual({ z: 11, x: 972, y: 784 });
    expect(tileCoords(0, 0, 0)).toEqual({ z: 0, x: 0, y: 0 });
    expect(tileCoords(89, 179.9, 2).y).toBe(0);
    expect(tileUrl(38.7223, -9.1393, 11.6)).toBe("https://tile.openstreetmap.org/11/972/784.png");
  });

  it("recognises the OSM block image by its cache header or its hash", async () => {
    // What OSM sent to an anonymous client on 2026-10-29: 200, no-cache, the fixed image.
    expect((await probeTile("u", deps({ cacheControl: "no-cache", hash: OSM_BLOCK_IMAGE_SHA256 }))).blocked).toBe(true);
    expect((await probeTile("u", deps({ cacheControl: "no-cache" }))).blocked).toBe(true);
    expect((await probeTile("u", deps({ cacheControl: "max-age=87968, stale-while-revalidate=604800", hash: OSM_BLOCK_IMAGE_SHA256 }))).blocked).toBe(true);
    // A real tile: cacheable, a different image.
    expect((await probeTile("u", deps({ cacheControl: "max-age=87968, stale-while-revalidate=604800" }))).blocked).toBe(false);
    // No digest (plain http from another host) and a cacheable tile: no verdict.
    expect((await probeTile("u", deps({ cacheControl: "max-age=1", hash: null }))).blocked).toBe(false);
  });

  it("gives no verdict on a tile that fails to load", async () => {
    expect(await probeTile("u", deps({ ok: false, cacheControl: "no-cache" }))).toEqual({ blocked: false });
    expect(await probeTile("u", deps({ throws: true }))).toEqual({ blocked: false });
  });
});
