import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { applyOps, emptySpec, type SpecOp } from "../contract";
import { Renderer } from "./Renderer";
import { Stage } from "./Stage";

const build = (ops: SpecOp[]) => applyOps(emptySpec(), ops);

describe("Renderer", () => {
  it("renders a card with bound markdown, a table and hotkeyed actions", () => {
    const spec = build([
      { op: "set_data", value: { meeting: { summary: "Review at **11:00**" }, rows: [{ name: "Bolts", qty: 12 }] } },
      { op: "add_node", id: "card", node: { type: "Card", props: { title: "Next meeting" }, slots: { body: ["md", "tbl"] }, actions: { primary: { id: "go", label: "Navigate" } } } },
      { op: "add_node", id: "md", node: { type: "Markdown", props: { text: { bind: "$.meeting.summary" } } } },
      { op: "add_node", id: "tbl", node: { type: "Table", props: { columns: [{ key: "name", label: "Name" }, { key: "qty", label: "Qty", align: "right" }], rows: { bind: "$.rows" } } } },
      { op: "set_action", id: "go", action: { kind: "propose", tool: "open_directions" } },
      { op: "set_root", id: "card" },
    ]);
    const fire = vi.fn();
    render(<Renderer spec={spec} fire={fire} />);
    expect(screen.getByText("Next meeting")).toBeInTheDocument();
    expect(screen.getByText("11:00").tagName).toBe("STRONG");
    expect(screen.getByText("Bolts")).toBeInTheDocument();
    expect(screen.getByText("Navigate")).toBeInTheDocument();
    expect(screen.getByText("1").tagName).toBe("KBD");
    screen.getByText("Navigate").parentElement!.click();
    expect(fire).toHaveBeenCalledWith("go", "card");
  });

  it("renders nothing for pending bindings and reports invalid nodes", () => {
    const onInvalid = vi.fn();
    const spec = build([
      { op: "add_node", id: "s", node: { type: "Stack", slots: { children: ["stat", "bad"] } } },
      { op: "add_node", id: "stat", node: { type: "Stat", props: { label: "L", value: { bind: "$.later" } } } },
      { op: "add_node", id: "bad", node: { type: "Status", props: { text: "x" } } },
      { op: "set_data", value: { later: 1 } },
      { op: "set_root", id: "s" },
    ]);
    // Make `bad` invalid after the fact by corrupting resolved data: use a
    // Stat with a wrong enum through set_props on a fresh spec instead.
    const invalid = applyOps(spec, [{ op: "set_props", id: "stat", props: { trend: "sideways" } }]);
    render(<Renderer spec={invalid} fire={() => {}} onInvalid={onInvalid} />);
    expect(screen.queryByText("L")).toBeNull();
    expect(onInvalid).toHaveBeenCalledWith("stat", expect.stringContaining("trend"));
    expect(screen.getByText("x")).toBeInTheDocument();
  });

  it("renders every non-layout component from its catalog example except Map", async () => {
    const { catalog } = await import("../contract");
    for (const [name, def] of Object.entries(catalog.components)) {
      if (def.category === "layout" || !def.example || name === "Map") continue;
      const spec = build([{ op: "add_node", id: "n", node: { type: name, props: def.example as Record<string, unknown> } }, { op: "set_root", id: "n" }]);
      const onInvalid = vi.fn();
      const { unmount, container } = render(<Renderer spec={spec} fire={() => {}} onInvalid={onInvalid} />);
      expect(onInvalid, name).not.toHaveBeenCalled();
      expect(container.querySelector(`[data-type="${name}"]`), name).not.toBeNull();
      unmount();
    }
  });
});

describe("Stage", () => {
  it("places glance overlays and panels", () => {
    const glance = build([
      { op: "add_node", id: "o", node: { type: "Overlay", props: { position: "top_right" }, slots: { content: ["s"] } } },
      { op: "add_node", id: "s", node: { type: "Status", props: { text: "hello" } } },
      { op: "set_root", id: "o" },
    ]);
    const { container, rerender } = render(<Stage spec={glance} agent={<div>agent</div>} fire={() => {}} />);
    expect(container.querySelector("[data-placement]")?.getAttribute("data-placement")).toBe("glance");
    expect(screen.getByText("hello")).toBeInTheDocument();
    rerender(<Stage spec={emptySpec()} agent={<div>agent</div>} fire={() => {}} />);
    expect(container.querySelector("[data-placement]")?.getAttribute("data-placement")).toBe("none");
  });
});

describe("floating overlays", () => {
  it("renders unreferenced overlays beside the root and hotkeys their actions", () => {
    const spec = build([
      { op: "add_node", id: "main", node: { type: "Card", props: { title: "Main" } } },
      { op: "set_root", id: "main" },
      { op: "set_action", id: "yes", action: { kind: "tool", tool: "confirm_proposal", args: { proposal_id: "p1" } } },
      { op: "set_action", id: "no", action: { kind: "tool", tool: "reject_proposal", args: { proposal_id: "p1" } } },
      { op: "add_node", id: "confirm_p1_card", node: { type: "Confirm", props: { proposal_id: "p1", title: "Set a reminder" }, actions: { confirm: { id: "yes", label: "Do it", hotkey: "enter" }, reject: { id: "no", label: "Cancel", hotkey: "escape" } } } },
      { op: "add_node", id: "confirm_p1", node: { type: "Overlay", props: { position: "bottom_right" }, slots: { content: ["confirm_p1_card"] } } },
    ]);
    const fire = vi.fn();
    const { container } = render(<Renderer spec={spec} fire={fire} />);
    expect(screen.getByText("Main")).toBeInTheDocument();
    expect(screen.getByText("Set a reminder")).toBeInTheDocument();
    expect(container.querySelector('[data-floating="confirm_p1"]')).not.toBeNull();
    expect(screen.getByText("Enter").tagName).toBe("KBD");
    screen.getByText("Do it").parentElement!.click();
    expect(fire).toHaveBeenCalledWith("yes", "confirm_p1_card");
  });
});
