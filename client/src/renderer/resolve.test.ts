import { describe, expect, it } from "vitest";

import { applyOps, emptySpec, type SpecOp } from "../contract";
import { assignHotkeys, floatingOverlays, overlayGroups, placement, resolveNode, withDefaults } from "./resolve";

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

describe("assignHotkeys and proposals", () => {
  it("gives no digit to a confirm_proposal action below the top card; cancel actions still get one", () => {
    const spec = build([
      { op: "set_action", id: "p1_yes", action: { kind: "tool", tool: "confirm_proposal", args: { proposal_id: "p1" } } },
      { op: "set_action", id: "p1_no", action: { kind: "tool", tool: "reject_proposal", args: { proposal_id: "p1" } } },
      { op: "set_action", id: "p2_yes", action: { kind: "tool", tool: "confirm_proposal", args: { proposal_id: "p2" } } },
      { op: "set_action", id: "p2_no", action: { kind: "tool", tool: "reject_proposal", args: { proposal_id: "p2" } } },
      { op: "add_node", id: "c1", node: { type: "Confirm", props: { proposal_id: "p1", title: "A" }, actions: { confirm: { id: "p1_yes", label: "Do it", hotkey: "enter" }, reject: { id: "p1_no", label: "Cancel", hotkey: "escape" } } } },
      { op: "add_node", id: "c2", node: { type: "Confirm", props: { proposal_id: "p2", title: "B" }, actions: { confirm: { id: "p2_yes", label: "Do it" }, reject: { id: "p2_no", label: "Cancel" } } } },
      { op: "add_node", id: "stack", node: { type: "Stack", slots: { children: ["c1", "c2"] } } },
      { op: "add_node", id: "proposals", node: { type: "Overlay", props: { position: "bottom_right" }, slots: { content: ["stack"] } } },
    ]);
    const keys = assignHotkeys(spec);
    expect(keys.get("p1_yes")?.hotkey).toBe("enter");
    expect(keys.get("p2_yes")?.hotkey).toBe(""); // voice or Enter once it is on top
    expect(keys.get("p2_no")?.hotkey).toBe("1");
  });
});

describe("overlayGroups", () => {
  it("groups floating overlays by anchor, in id order", () => {
    const spec = build([
      { op: "add_node", id: "status_card", node: { type: "Overlay", props: { position: "top_right" } } },
      { op: "add_node", id: "reply_card", node: { type: "Overlay", props: { position: "top_right" } } },
      { op: "add_node", id: "ambient_clock", node: { type: "Overlay", props: { position: "top_left" } } },
      { op: "add_node", id: "root", node: { type: "Overlay", props: {} } },
      { op: "set_root", id: "root" },
    ]);
    expect(overlayGroups(spec)).toEqual([
      { position: "top_right", ids: ["root", "reply_card", "status_card"] },
      { position: "top_left", ids: ["ambient_clock"] },
    ]);
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

describe("floatingOverlays", () => {
  it("lists overlays that are neither root nor referenced", () => {
    const spec = build([
      { op: "add_node", id: "root", node: { type: "Overlay", props: {}, slots: { content: ["inner"] } } },
      { op: "add_node", id: "inner", node: { type: "Overlay", props: {} } },
      { op: "add_node", id: "b", node: { type: "Overlay", props: {} } },
      { op: "add_node", id: "a", node: { type: "Overlay", props: {} } },
      { op: "add_node", id: "card", node: { type: "Card", props: {} } },
      { op: "set_root", id: "root" },
    ]);
    expect(floatingOverlays(spec)).toEqual(["a", "b"]);
  });
});
