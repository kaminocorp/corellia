import { describe, expect, it } from "vitest";

import { AdaptiveResolution } from "./adaptive";

describe("AdaptiveResolution", () => {
  it("lowers the scale under sustained slow frames and raises it with headroom", () => {
    const a = new AdaptiveResolution({ cooldownMs: 100, step: 0.1 });
    expect(a.scale).toBe(1);
    let changes = 0;
    for (let i = 0; i < 200; i++) if (a.update(50)) changes++;
    expect(a.scale).toBe(0.5);
    expect(changes).toBe(5);
    for (let i = 0; i < 400; i++) a.update(8);
    expect(a.scale).toBe(1);
  });

  it("respects the cooldown and ignores bad samples", () => {
    const a = new AdaptiveResolution({ cooldownMs: 1000 });
    for (let i = 0; i < 10; i++) expect(a.update(50)).toBe(false); // 500 ms elapsed, still cooling down
    expect(a.update(NaN)).toBe(false);
    expect(a.update(-1)).toBe(false);
    for (let i = 0; i < 11; i++) a.update(50);
    expect(a.scale).toBe(0.9);
    expect(a.fps).toBeGreaterThan(0);
  });
});
