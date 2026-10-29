import { useEffect } from "react";

import type { ResolvedAction } from "../components/types";

export type GlobalKeyHandlers = {
  /** True when the command input holds no text (hotkeys are live). */
  inputEmpty: () => boolean;
  hotkeys: Map<string, ResolvedAction>;
  fire: (actionId: string, nodeId: string) => void;
  /** Escape while a turn runs. */
  cancel: () => boolean;
  /** Escape with nothing else to do. */
  clear: () => void;
};

/** Resolves a key to what it should do; exported for tests. */
export function resolveKey(key: string, h: GlobalKeyHandlers): "fire" | "cancel" | "clear" | null {
  if (!h.inputEmpty()) return null;
  const byKey = (k: string) => [...h.hotkeys.values()].find((a) => a.hotkey === k);
  if (key === "Escape") {
    if (h.cancel()) return "cancel";
    if (byKey("escape")) return "fire";
    return "clear";
  }
  if (key === "Enter") return byKey("enter") ? "fire" : null;
  if (/^[1-9]$/.test(key)) return byKey(key) ? "fire" : null;
  return null;
}

export function useGlobalKeys(h: GlobalKeyHandlers) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const what = resolveKey(e.key, h);
      if (!what) return;
      e.preventDefault();
      if (what === "fire") {
        const k = e.key === "Escape" ? "escape" : e.key === "Enter" ? "enter" : e.key;
        const a = [...h.hotkeys.values()].find((x) => x.hotkey === k);
        if (a) h.fire(a.id, a.nodeId);
      } else if (what === "clear") {
        h.clear();
      }
      // "cancel" already happened inside resolveKey via h.cancel().
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [h]);
}
