import { catalog, resolveProps, validateProps, type Node, type UISpec } from "../contract";
import type { ResolvedAction } from "../components/types";

/** Applies the catalog's `default` values for props the node omits. */
export function withDefaults(type: string, props: Record<string, unknown>): Record<string, unknown> {
  const def = catalog.components[type];
  const schemaProps = (def?.props as { properties?: Record<string, { default?: unknown }> } | undefined)?.properties ?? {};
  const out = { ...props };
  for (const [k, s] of Object.entries(schemaProps)) {
    if (out[k] === undefined && s.default !== undefined) out[k] = s.default;
  }
  return out;
}

export type ResolvedNode =
  | { status: "ready"; props: Record<string, unknown> }
  | { status: "pending"; unresolved: string[] }
  | { status: "invalid"; message: string };

/** Resolves bindings, applies defaults and validates. Only `ready` renders. */
export function resolveNode(node: Node, data: UISpec["data"]): ResolvedNode {
  const { resolved, unresolved } = resolveProps(node.props ?? {}, data);
  if (unresolved.length) return { status: "pending", unresolved };
  const r = validateProps(node.type, resolved);
  if (!r.ok) return { status: "invalid", message: r.message };
  return { status: "ready", props: withDefaults(node.type, resolved) };
}

/**
 * Assigns hotkeys to every action reachable from the root, depth first in
 * slot order. Explicit hotkeys are kept; the rest get 1..9 in order.
 * Actions past the ninth get no key (still listed, voice-reachable).
 */
export function assignHotkeys(spec: UISpec): Map<string, ResolvedAction> {
  const out = new Map<string, ResolvedAction>();
  const used = new Set<string>();
  const pending: Array<{ ref: ResolvedAction }> = [];
  const visit = (id: string, seen: Set<string>) => {
    if (seen.has(id)) return;
    seen.add(id);
    const n = spec.nodes[id];
    if (!n) return;
    for (const [slot, ref] of Object.entries(n.actions ?? {})) {
      if (!ref || !(ref.id in spec.actions)) continue;
      const action: ResolvedAction = { ...ref, slot, nodeId: id, hotkey: ref.hotkey ?? "" };
      if (ref.hotkey) used.add(ref.hotkey);
      pending.push({ ref: action });
    }
    for (const children of Object.values(n.slots ?? {})) for (const c of children ?? []) visit(c, seen);
  };
  const seen = new Set<string>();
  if (spec.root) visit(spec.root, seen);
  for (const id of floatingOverlays(spec)) visit(id, seen);
  let digit = 1;
  for (const { ref } of pending) {
    if (!ref.hotkey) {
      while (digit <= 9 && used.has(String(digit))) digit++;
      if (digit <= 9) {
        ref.hotkey = String(digit);
        used.add(ref.hotkey);
        digit++;
      }
    }
    out.set(ref.id, ref);
  }
  return out;
}

/**
 * Floating overlays: `Overlay` nodes that no slot references and that are
 * not the root (REDUCER.md). The session uses them for confirmation,
 * reply and proactive cards. Sorted by id for a stable order.
 */
export function floatingOverlays(spec: UISpec): string[] {
  const referenced = new Set<string>();
  for (const n of Object.values(spec.nodes)) {
    for (const children of Object.values(n.slots ?? {})) for (const c of children ?? []) referenced.add(c);
  }
  return Object.entries(spec.nodes)
    .filter(([id, n]) => n.type === "Overlay" && id !== spec.root && !referenced.has(id))
    .map(([id]) => id)
    .sort();
}

export type Placement = "none" | "glance" | "panel" | "full";

/** Where the root tree goes relative to the agent. */
export function placement(spec: UISpec): Placement {
  if (!spec.root) return "none";
  const root = spec.nodes[spec.root];
  if (!root) return "none";
  if (root.type === "Overlay") return "glance";
  const def = catalog.components[root.type];
  const fit = def?.fit ?? [];
  if (fit.includes("full") && !fit.includes("glance")) return "full";
  return "panel";
}
