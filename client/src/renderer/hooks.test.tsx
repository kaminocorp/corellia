import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ResolvedAction } from "../components/types";
import { applyOps, emptySpec } from "../contract";
import { useDecay } from "./useDecay";
import { DIGIT_GRACE_MS, resolveKey, useGlobalKeys, type GlobalKeyHandlers } from "./useGlobalKeys";

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

describe("useGlobalKeys", () => {
  it("ignores auto-repeat so a held Enter cannot confirm a proposal", () => {
    const fire = vi.fn();
    const ok: ResolvedAction = { id: "ok", label: "Do it", hotkey: "enter", slot: "confirm", nodeId: "card" };
    const h: GlobalKeyHandlers = {
      inputValue: () => "",
      clearInput: () => {},
      hotkeys: new Map([["ok", ok]]),
      fire,
      cancel: () => false,
      clear: () => {},
      scroll: () => false,
    };
    renderHook(() => useGlobalKeys(h));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", repeat: true }));
    expect(fire).not.toHaveBeenCalled();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    expect(fire).toHaveBeenCalledWith("ok", "card");
  });
});

describe("resolveKey", () => {
  const action = (id: string, hotkey: string): ResolvedAction => ({ id, label: id, hotkey, slot: "primary", nodeId: "n" });
  const handlers = (over: Partial<GlobalKeyHandlers> = {}): GlobalKeyHandlers => ({
    inputValue: () => "",
    clearInput: () => {},
    hotkeys: new Map([
      ["ok", action("ok", "enter")],
      ["two", action("two", "2")],
    ]),
    fire: () => {},
    cancel: () => false,
    clear: () => {},
    scroll: () => true,
    ...over,
  });
  it("does nothing while typing", () => {
    expect(resolveKey("Escape", handlers({ inputValue: () => "x" }))).toBeNull();
    expect(resolveKey("ArrowDown", handlers({ inputValue: () => "x" }))).toBeNull();
  });
  it("prefers cancel, then escape actions, then clear", () => {
    expect(resolveKey("Escape", handlers({ cancel: () => true }))).toBe("cancel");
    expect(resolveKey("Escape", handlers({ hotkeys: new Map([["no", action("no", "escape")]]) }))).toBe("fire");
    expect(resolveKey("Escape", handlers())).toBe("clear");
  });
  it("fires enter and digit actions only when mapped; digits wait for the grace period", () => {
    expect(resolveKey("Enter", handlers())).toBe("fire");
    expect(resolveKey("2", handlers())).toBe("digit");
    expect(resolveKey("3", handlers())).toBeNull();
    expect(resolveKey("a", handlers())).toBeNull();
    expect(resolveKey("PageDown", handlers())).toBe("scroll");
  });
});

describe("useGlobalKeys digit grace period", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());
  const action = (id: string, hotkey: string): ResolvedAction => ({ id, label: id, hotkey, slot: "primary", nodeId: "n" });
  const setup = () => {
    let value = "";
    const fire = vi.fn();
    const clearInput = vi.fn(() => {
      value = "";
    });
    const h: GlobalKeyHandlers = {
      inputValue: () => value,
      clearInput,
      hotkeys: new Map([["two", action("two", "2")]]),
      fire,
      cancel: () => false,
      clear: () => {},
      scroll: () => false,
    };
    renderHook(() => useGlobalKeys(h));
    return { fire, clearInput, type: (v: string) => (value = v) };
  };
  it("a lone digit fires its action after the grace period and leaves the input", () => {
    const { fire, clearInput, type } = setup();
    const e = new KeyboardEvent("keydown", { key: "2", cancelable: true });
    window.dispatchEvent(e);
    expect(e.defaultPrevented).toBe(false); // the digit goes into the input
    type("2");
    vi.advanceTimersByTime(DIGIT_GRACE_MS - 1);
    expect(fire).not.toHaveBeenCalled();
    vi.advanceTimersByTime(2);
    expect(clearInput).toHaveBeenCalled();
    expect(fire).toHaveBeenCalledWith("two", "n");
  });
  it("a digit followed by typing is the start of a message", () => {
    const { fire, clearInput, type } = setup();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "2", cancelable: true }));
    type("2");
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "0", cancelable: true }));
    type("20");
    vi.advanceTimersByTime(DIGIT_GRACE_MS + 10);
    expect(fire).not.toHaveBeenCalled();
    expect(clearInput).not.toHaveBeenCalled();
  });
});
