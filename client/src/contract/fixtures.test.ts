import { describe, expect, it } from "vitest";

import type { SpecOp } from "./gen/ops";
import { applyOp, applyOps, canonical, emptySpec, ReducerError, stableStringify } from "./reducer";
import { checkOp, checkSpec } from "./validate";
import { validateSpec } from "./registry";

type Fixture = Record<string, unknown>;
const files = import.meta.glob("../../../shared/schema/fixtures/**/*.json", { eager: true, import: "default" }) as Record<
  string,
  Fixture
>;

function group(dir: string): Array<[string, Fixture]> {
  return Object.entries(files)
    .filter(([p]) => p.includes(`/fixtures/${dir}/`))
    .map(([p, f]) => [p.split("/").pop()!.replace(".json", ""), f] as [string, Fixture])
    .sort((a, b) => a[0].localeCompare(b[0]));
}

function applyChecked(ops: SpecOp[]) {
  let spec = emptySpec();
  ops.forEach((op, i) => {
    const issue = checkOp(spec, op);
    if (issue) throw new Error(`op ${i} (${op.op}) rejected: ${issue.code}: ${issue.message}`);
    spec = applyOp(spec, op);
  });
  return spec;
}

describe("reducer goldens (shared with Go)", () => {
  const cases = group("reducer").filter(([n]) => !n.endsWith(".golden"));
  expect(cases.length).toBeGreaterThan(0);
  for (const [name, fx] of cases) {
    it(name, () => {
      const golden = files[`../../../shared/schema/fixtures/reducer/${name}.golden.json`];
      expect(golden, "golden missing; run `go test ./internal/uispec -update`").toBeDefined();
      const spec = applyOps(emptySpec(), fx.ops as SpecOp[]);
      expect(canonical(spec)).toBe(stableStringify(golden));
    });
  }
});

describe("valid fixtures", () => {
  for (const [name, fx] of group("valid")) {
    it(name, () => {
      const spec = applyChecked(fx.ops as SpecOp[]);
      expect(checkSpec(spec)).toEqual([]);
      expect(validateSpec(spec).ok).toBe(true);
    });
  }
});

describe("invalid op fixtures", () => {
  for (const [name, fx] of group("invalid")) {
    it(name, () => {
      const spec = applyChecked(fx.before as SpecOp[]);
      const issue = checkOp(spec, fx.op as SpecOp);
      expect(issue?.code).toBe(fx.code);
    });
  }
});

describe("reducer error fixtures", () => {
  for (const [name, fx] of group("reducer-errors")) {
    it(name, () => {
      const spec = applyChecked(fx.before as SpecOp[]);
      const op = fx.op as SpecOp;
      const issue = checkOp(spec, op);
      if (issue) expect(issue.code).toBe(fx.code);
      let code: string | undefined;
      try {
        applyOp(spec, op);
      } catch (e) {
        code = e instanceof ReducerError ? e.code : "other";
      }
      expect(code).toBe(fx.code);
    });
  }
});

describe("invalid spec fixtures", () => {
  for (const [name, fx] of group("invalid-spec")) {
    it(name, () => {
      const spec = applyChecked(fx.ops as SpecOp[]);
      const codes = [...new Set(checkSpec(spec).map((i) => i.code))].sort();
      expect(codes).toEqual(fx.codes);
    });
  }
});
