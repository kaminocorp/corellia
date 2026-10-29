import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ResolvedAction } from "../components/types";
import { applyOps, emptySpec } from "../contract";
import { useDecay } from "./useDecay";
import { resolveKey, type GlobalKeyHandlers } from "./useGlobalKeys";

describe("useDecay", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());
  it("expires nodes after ttl relative to touched", () => {
    const now = 1_000_000;
    vi.setSystemTime(now);
    const spec = applyOps(emptySpec(), [
      { op: "add_node", id: "a", node: { type: "Status", props: { text: "a" }, ttl_ms: 5000 } },
      { op: "add_node", id: "b", node: { type: "Status", props: { text: "b" } } },
      { op: "set_root", id: "a" },
    ]);
    const onExpire = vi.fn();
    renderHook(() => useDecay(spec, { a: now - 2000 }, onExpire, () => Date.now()));
    vi.advanceTimersByTime(2999);
    expect(onExpire).not.toHaveBeenCalled();
    vi.advanceTimersByTime(2);
    expect(onExpire).toHaveBeenCalledWith("a");
    expect(onExpire).toHaveBeenCalledTimes(1);
  });
});

describe("resolveKey", () => {
  const action = (id: string, hotkey: string): ResolvedAction => ({ id, label: id, hotkey, slot: "primary", nodeId: "n" });
  const handlers = (over: Partial<GlobalKeyHandlers> = {}): GlobalKeyHandlers => ({
    inputEmpty: () => true,
    hotkeys: new Map([
      ["ok", action("ok", "enter")],
      ["two", action("two", "2")],
    ]),
    fire: () => {},
    cancel: () => false,
    clear: () => {},
    ...over,
  });
  it("does nothing while typing", () => {
    expect(resolveKey("Escape", handlers({ inputEmpty: () => false }))).toBeNull();
  });
  it("prefers cancel, then escape actions, then clear", () => {
    expect(resolveKey("Escape", handlers({ cancel: () => true }))).toBe("cancel");
    expect(resolveKey("Escape", handlers({ hotkeys: new Map([["no", action("no", "escape")]]) }))).toBe("fire");
    expect(resolveKey("Escape", handlers())).toBe("clear");
  });
  it("fires enter and digit actions only when mapped", () => {
    expect(resolveKey("Enter", handlers())).toBe("fire");
    expect(resolveKey("2", handlers())).toBe("fire");
    expect(resolveKey("3", handlers())).toBeNull();
    expect(resolveKey("a", handlers())).toBeNull();
  });
});
