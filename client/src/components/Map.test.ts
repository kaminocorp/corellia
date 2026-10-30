import { describe, expect, it } from "vitest";

import { isTileError } from "./mapErrors";

describe("Map error classification", () => {
  it("treats tile failures as transient and other errors as fatal", () => {
    expect(isTileError({ error: new Error("Failed to fetch"), tile: {}, sourceId: "osm" })).toBe(true);
    expect(isTileError({ error: new Error("AJAXError: 404 (Not Found)") })).toBe(true);
    expect(isTileError({ error: new Error("Failed to initialize WebGL.") })).toBe(false);
    expect(isTileError({})).toBe(false);
  });
});
