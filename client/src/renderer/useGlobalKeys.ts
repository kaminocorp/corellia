import { useEffect } from "react";

import type { ResolvedAction } from "../components/types";

export type ScrollDirection = "up" | "down" | "page_up" | "page_down";

export type GlobalKeyHandlers = {
  /** The command input's current text (hotkeys are live while it is empty). */
  inputValue: () => string;
  /** Empties the command input (a lone digit that turned out to be a hotkey). */
  clearInput: () => void;
  hotkeys: Map<string, ResolvedAction>;
  fire: (actionId: string, nodeId: string) => void;
  /** Escape while a turn runs. */
  cancel: () => boolean;
  /** Escape with nothing else to do. */
  clear: () => void;
  /** Scrolls the generated UI; returns false when there is nothing to scroll. */
  scroll: (dir: ScrollDirection) => boolean;
};

/**
 * How long a lone digit waits before it fires its action. A digit followed
 * by more typing within this window is the start of a message ("10 minute
 * timer"), not a hotkey (review 2026-10-29).
 */
export const DIGIT_GRACE_MS = 350;

const SCROLL_KEYS: Record<string, ScrollDirection> = { ArrowUp: "up", ArrowDown: "down", PageUp: "page_up", PageDown: "page_down" };

/** Resolves a key to what it should do; exported for tests. */
export function resolveKey(key: string, h: GlobalKeyHandlers): "fire" | "cancel" | "clear" | "digit" | "scroll" | null {
  if (h.inputValue() !== "") return null;
  const byKey = (k: string) => [...h.hotkeys.values()].find((a) => a.hotkey === k);
  if (key === "Escape") {
    if (h.cancel()) return "cancel";
    if (byKey("escape")) return "fire";
    return "clear";
  }
  if (key === "Enter") return byKey("enter") ? "fire" : null;
  if (/^[1-9]$/.test(key)) return byKey(key) ? "digit" : null;
  if (key in SCROLL_KEYS) return "scroll";
  return null;
}

export function useGlobalKeys(h: GlobalKeyHandlers) {
  useEffect(() => {
    let pendingDigit: { key: string; timer: number } | null = null;
    const cancelDigit = () => {
      if (pendingDigit) window.clearTimeout(pendingDigit.timer);
      pendingDigit = null;
    };
    const fireKey = (k: string) => {
      const a = [...h.hotkeys.values()].find((x) => x.hotkey === k);
      if (a) h.fire(a.id, a.nodeId);
    };
    const onKey = (e: KeyboardEvent) => {
      // Any further key settles a pending digit: it was the start of a message.
      cancelDigit();
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // The command input marks the Enter that sent a message as handled.
      if (e.defaultPrevented) return;
      // A held key must not confirm or fire anything: the auto-repeat of the
      // Enter that just sent a message used to confirm the pending proposal
      // (review 2026-10-30).
      if (e.repeat) return;
      const what = resolveKey(e.key, h);
      if (!what) return;
      if (what === "digit") {
        // Let the digit into the input; fire only if it is still alone
        // after the grace period, in which case it leaves the input again.
        const key = e.key;
        const timer = window.setTimeout(() => {
          pendingDigit = null;
          if (h.inputValue() !== key) return;
          h.clearInput();
          fireKey(key);
        }, DIGIT_GRACE_MS);
        pendingDigit = { key, timer };
        return;
      }
      if (what === "scroll") {
        if (h.scroll(SCROLL_KEYS[e.key])) e.preventDefault();
        return;
      }
      e.preventDefault();
      if (what === "fire") {
        fireKey(e.key === "Escape" ? "escape" : "enter");
      } else if (what === "clear") {
        h.clear();
      }
      // "cancel" already happened inside resolveKey via h.cancel().
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelDigit();
      window.removeEventListener("keydown", onKey);
    };
  }, [h]);
}
