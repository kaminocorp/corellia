import { describe, expect, it } from "vitest";

import { areaPath, buildScales, linePath, niceTicks } from "./chart-geometry";

describe("chart geometry", () => {
  it("produces nice ticks", () => {
    expect(niceTicks(0, 10, 4)).toEqual([0, 2.5, 5, 7.5, 10]);
    expect(niceTicks(17, 21, 4)).toEqual([17, 18, 19, 20, 21]);
    expect(niceTicks(5, 5)).toEqual([5]);
  });
  it("scales categories and values", () => {
    const sc = buildScales([{ name: "a", points: [{ x: "Mon", y: 10 }, { x: "Tue", y: 20 }] }], 100, 50);
    expect(sc.categories).toEqual(["Mon", "Tue"]);
    expect(sc.yMin).toBe(0); // bars start at zero
    expect(sc.yMax).toBe(20);
    expect(sc.x(0, 2)).toBe(25);
    expect(sc.y(20)).toBe(0);
    expect(sc.y(0)).toBe(50);
  });
  it("respects explicit bounds and empty input", () => {
    const sc = buildScales([{ name: "a", points: [{ x: 1, y: 5 }] }], 100, 50, 2, 8);
    expect([sc.yMin, sc.yMax]).toEqual([2, 8]);
    const empty = buildScales([], 100, 50);
    expect([empty.yMin, empty.yMax]).toEqual([0, 1]);
  });
  it("builds paths", () => {
    expect(linePath([[0, 0], [10, 5]])).toBe("M0.00 0.00 L10.00 5.00");
    expect(areaPath([[0, 0], [10, 5]], 50)).toBe("M0.00 0.00 L10.00 5.00 L10.00 50.00 L0.00 50.00 Z");
    expect(areaPath([], 50)).toBe("");
  });
});
