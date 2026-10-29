import { describe, expect, it } from "vitest";

import { applyOps, emptySpec, type SpecOp } from "../contract";
import { assignHotkeys, placement, resolveNode, withDefaults } from "./resolve";

const build = (ops: SpecOp[]) => applyOps(emptySpec(), ops);

describe("resolveNode", () => {
  it("applies defaults and validates", () => {
    expect(withDefaults("Stack", {})).toEqual({ direction: "column", gap: "md", align: "stretch" });
    const r = resolveNode({ type: "Stat", props: { label: "L", value: { bind: "$.v" } } }, { v: 3 });
    expect(r).toEqual({ status: "ready", props: { label: "L", value: 3 } });
    expect(resolveNode({ type: "Stat", props: { label: "L", value: { bind: "$.v" } } }, {})).toEqual({ status: "pending", unresolved: ["value"] });
    expect(resolveNode({ type: "Stat", props: { label: "L" } }, {}).status).toBe("invalid");
  });
});

describe("assignHotkeys", () => {
  it("keeps explicit keys and numbers the rest in tree order", () => {
    const spec = build([
      { op: "add_node", id: "root", node: { type: "Stack", slots: { children: ["a", "b"] } } },
      { op: "add_node", id: "a", node: { type: "Card", props: {}, actions: { primary: { id: "x", label: "X" }, secondary: { id: "y", label: "Y", hotkey: "2" } } } },
      { op: "add_node", id: "b", node: { type: "Confirm", props: { proposal_id: "p", title: "t" }, actions: { confirm: { id: "ok", label: "Ok", hotkey: "enter" }, reject: { id: "no", label: "No" } } } },
      { op: "set_action", id: "x", action: { kind: "dismiss", target: "a" } },
      { op: "set_action", id: "y", action: { kind: "dismiss", target: "a" } },
      { op: "set_action", id: "ok", action: { kind: "dismiss", target: "b" } },
      { op: "set_root", id: "root" },
    ]);
    const keys = assignHotkeys(spec);
    expect(keys.get("x")?.hotkey).toBe("1");
    expect(keys.get("y")?.hotkey).toBe("2");
    expect(keys.get("ok")?.hotkey).toBe("enter");
    expect(keys.has("no")).toBe(false); // dangling action record is skipped
    expect(keys.get("x")?.nodeId).toBe("a");
  });
});

describe("placement", () => {
  it("derives the zone from the root component", () => {
    expect(placement(emptySpec())).toBe("none");
    expect(placement(build([{ op: "add_node", id: "o", node: { type: "Overlay", props: {} } }, { op: "set_root", id: "o" }]))).toBe("glance");
    expect(placement(build([{ op: "add_node", id: "s", node: { type: "Split", props: {} } }, { op: "set_root", id: "s" }]))).toBe("full");
    expect(placement(build([{ op: "add_node", id: "c", node: { type: "Card", props: {} } }, { op: "set_root", id: "c" }]))).toBe("panel");
    expect(placement(build([{ op: "set_root", id: "ghost" }]))).toBe("none");
  });
});
