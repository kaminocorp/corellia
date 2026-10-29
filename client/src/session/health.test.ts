import { describe, expect, it } from "vitest";

import { fetchHealth } from "./health";

const jsonResponse = (body: unknown, ok = true) =>
  (async () => ({ ok, json: async () => body })) as unknown as typeof fetch;

describe("fetchHealth", () => {
  it("parses a healthy response", async () => {
    const h = await fetchHealth(jsonResponse({ ok: true, version: "1", dev_mode: true }));
    expect(h).toEqual({ ok: true, version: "1", commit: "", dev_mode: true, time: "" });
  });
  it("returns null on non-2xx", async () => {
    expect(await fetchHealth(jsonResponse({}, false))).toBeNull();
  });
  it("returns null on malformed body", async () => {
    expect(await fetchHealth(jsonResponse({ nope: 1 }))).toBeNull();
  });
  it("returns null when fetch throws", async () => {
    const throwing = (async () => {
      throw new Error("net");
    }) as unknown as typeof fetch;
    expect(await fetchHealth(throwing)).toBeNull();
  });
});
