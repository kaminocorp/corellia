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

  it("stacks floating overlays that share an anchor instead of piling them up", () => {
    const spec = build([
      { op: "add_node", id: "reply_text", node: { type: "Markdown", props: { text: "Reply" } } },
      { op: "add_node", id: "reply_card", node: { type: "Overlay", props: { position: "top_right" }, slots: { content: ["reply_text"] } } },
      { op: "add_node", id: "status_text", node: { type: "Status", props: { text: "That didn't work", level: "error" } } },
      { op: "add_node", id: "status_card", node: { type: "Overlay", props: { position: "top_right" }, slots: { content: ["status_text"] } } },
      { op: "add_node", id: "clock_text", node: { type: "Status", props: { text: "14:05" } } },
      { op: "add_node", id: "ambient_clock", node: { type: "Overlay", props: { position: "top_left" }, slots: { content: ["clock_text"] } } },
    ]);
    const { container } = render(<Renderer spec={spec} fire={() => {}} />);
    const right = container.querySelector('[data-overlay-group="top_right"]')!;
    expect(right).not.toBeNull();
    expect(right.className).toContain("flex-col");
    expect(right.querySelectorAll("[data-floating]")).toHaveLength(2);
    expect(container.querySelector('[data-overlay-group="top_left"]')!.querySelectorAll("[data-floating]")).toHaveLength(1);
    // Inside a group each overlay lays out in flow, not absolutely over its neighbours.
    for (const el of right.querySelectorAll("[data-floating] > [data-node] > div")) expect(el.className).not.toContain("absolute");
    expect(screen.getByText("Reply")).toBeInTheDocument();
    expect(screen.getByText("That didn't work")).toBeInTheDocument();
  });

  it("reports an invalid node once, after render, not on every re-render", () => {
    const onInvalid = vi.fn();
    const spec = build([
      { op: "add_node", id: "stat", node: { type: "Stat", props: { label: "L", value: 1, trend: "sideways" } } },
      { op: "set_root", id: "stat" },
    ]);
    const { rerender } = render(<Renderer spec={spec} fire={() => {}} onInvalid={onInvalid} />);
    rerender(<Renderer spec={spec} fire={() => {}} onInvalid={onInvalid} />);
    rerender(<Renderer spec={spec} fire={() => {}} onInvalid={onInvalid} />);
    expect(onInvalid).toHaveBeenCalledTimes(1);
    expect(onInvalid).toHaveBeenCalledWith("stat", expect.stringContaining("trend"));
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

  it("shows no key cap for a confirm action below the top card", () => {
    const spec = build([
      { op: "set_action", id: "p1_yes", action: { kind: "tool", tool: "confirm_proposal", args: { proposal_id: "p1" } } },
      { op: "set_action", id: "p1_no", action: { kind: "tool", tool: "reject_proposal", args: { proposal_id: "p1" } } },
      { op: "set_action", id: "p2_yes", action: { kind: "tool", tool: "confirm_proposal", args: { proposal_id: "p2" } } },
      { op: "set_action", id: "p2_no", action: { kind: "tool", tool: "reject_proposal", args: { proposal_id: "p2" } } },
      { op: "add_node", id: "c1", node: { type: "Confirm", props: { proposal_id: "p1", title: "Top" }, actions: { confirm: { id: "p1_yes", label: "Do it", hotkey: "enter" }, reject: { id: "p1_no", label: "Cancel", hotkey: "escape" } } } },
      { op: "add_node", id: "c2", node: { type: "Confirm", props: { proposal_id: "p2", title: "Lower" }, actions: { confirm: { id: "p2_yes", label: "Do it" }, reject: { id: "p2_no", label: "Cancel" } } } },
      { op: "add_node", id: "o1", node: { type: "Overlay", props: { position: "bottom_right" }, slots: { content: ["c1"] } } },
      { op: "add_node", id: "o2", node: { type: "Overlay", props: { position: "bottom_right" }, slots: { content: ["c2"] } } },
    ]);
    const { container } = render(<Renderer spec={spec} fire={vi.fn()} />);
    const caps = Array.from(container.querySelectorAll("kbd")).map((k) => k.textContent);
    expect(caps).toEqual(["Enter", "Esc", "1"]);
    expect(container.querySelector('[data-action="p2_yes"] kbd')).toBeNull();
    expect(container.querySelector('[data-action="p2_yes"]')?.textContent).toBe("Do it");
  });
});

describe("Stage gutter (review 2026-10-30 round 5)", () => {
  it("a full visual ends before the gutter while floating cards are up, and the cards render there", () => {
    const spec = build([
      { op: "set_data", value: { pts: [{ x: "Mon", y: 1 }, { x: "Tue", y: 2 }] } },
      { op: "add_node", id: "chart", node: { type: "Chart", props: { kind: "line", data: { bind: "$.pts" }, x: "x", y: "y" } } },
      { op: "set_root", id: "chart" },
      { op: "add_node", id: "reply_text", node: { type: "Markdown", props: { text: "Noted." } } },
      { op: "add_node", id: "reply_card", node: { type: "Overlay", props: { position: "top_right" }, slots: { content: ["reply_text"] } } },
    ]);
    const { container, rerender } = render(<Stage spec={spec} agent={<div />} fire={() => {}} />);
    const root = container.querySelector("[data-placement]")!;
    expect(root.getAttribute("data-placement")).toBe("full");
    expect(root.getAttribute("data-gutter")).toBe("1");
    const zone = container.querySelector('[data-testid="ui-zone"]') as HTMLElement;
    // jsdom folds the calc; what matters is that an inline right inset is set at all.
    expect(zone.style.right).toMatch(/rem/);
    expect(container.querySelector('[data-overlay-group="gutter"] [data-node="reply_card"]')).not.toBeNull();
    expect(container.querySelector('[data-overlay-group="top_right"]')).toBeNull();
    // The card decays: the visual takes the full width again.
    const after = applyOps(spec, [{ op: "remove_node", id: "reply_card" }]);
    rerender(<Stage spec={after} agent={<div />} fire={() => {}} />);
    expect(container.querySelector("[data-placement]")!.getAttribute("data-gutter")).toBeNull();
    expect((container.querySelector('[data-testid="ui-zone"]') as HTMLElement).style.right).toBe("");
  });
});
