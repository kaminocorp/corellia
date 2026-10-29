import { describe, expect, it } from "vitest";

import { isBinding, parsePath, resolve, resolveProps, setPath } from "./path";

describe("parsePath", () => {
  it.each([
    ["$", 0],
    ["$.a", 1],
    ["$.a.b[2].c", 4],
    ["$[0]", 1],
  ])("parses %s", (p, n) => expect(parsePath(p)).toHaveLength(n));
  it.each(["a.b", "$.", "$.a[", "$.1a", "$ .a"])("rejects %s", (p) => expect(() => parsePath(p)).toThrow());
});

describe("resolve", () => {
  const data = { place: { coords: [38.72, -9.14] }, list: [{ k: "v" }], n: null };
  it("walks keys and indexes", () => {
    expect(resolve(data, "$.place.coords[1]")).toEqual([-9.14, true]);
    expect(resolve(data, "$.list[0].k")).toEqual(["v", true]);
    expect(resolve(data, "$.n")).toEqual([null, true]);
    expect(resolve(data, "$")[1]).toBe(true);
  });
  it("reports missing steps without throwing", () => {
    expect(resolve(data, "$.list[1]")[1]).toBe(false);
    expect(resolve(data, "$.place.coords.x")[1]).toBe(false);
    expect(resolve(data, "$.missing")[1]).toBe(false);
    expect(resolve(data, "garbage")[1]).toBe(false);
  });
});

describe("setPath", () => {
  it("does not mutate the input", () => {
    const data = { a: { b: 1 }, list: [1] };
    const out = setPath(data, "$.a.c", 2);
    expect(data).toEqual({ a: { b: 1 }, list: [1] });
    expect(out).toEqual({ a: { b: 1, c: 2 }, list: [1] });
    expect(out.list).toBe(data.list); // untouched branch shared
  });
  it("appends at length and rejects gaps", () => {
    expect(setPath({ list: [1] }, "$.list[1]", 2)).toEqual({ list: [1, 2] });
    expect(() => setPath({ list: [1] }, "$.list[3]", 2)).toThrow(/path_not_settable|not settable/);
  });
});

describe("bindings", () => {
  it("recognises only {bind: path}", () => {
    expect(isBinding({ bind: "$.a" })).toBe(true);
    expect(isBinding({ bind: "a" })).toBe(false);
    expect(isBinding({ bind: "$.a", x: 1 })).toBe(false);
    expect(isBinding("$.a")).toBe(false);
  });
  it("resolves props and lists unresolved keys sorted", () => {
    const r = resolveProps({ z: { bind: "$.missing" }, a: { bind: "$.x" }, lit: 1 }, { x: 5 });
    expect(r.resolved).toEqual({ a: 5, lit: 1 });
    expect(r.unresolved).toEqual(["z"]);
  });
});
