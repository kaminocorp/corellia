import { describe, expect, it } from "vitest";

import { catalog } from "../contract";
import { registry } from "./registry";

describe("component registry", () => {
  it("implements exactly the catalog", () => {
    const want = Object.keys(catalog.components).sort();
    const have = Object.keys(registry).sort();
    expect(have).toEqual(want);
  });
});
