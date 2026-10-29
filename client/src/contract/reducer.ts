/**
 * The spec reducer. Pure: returns a new spec with structural sharing.
 * Semantics: shared/schema/REDUCER.md. Mirrors backend/internal/uispec/reducer.go.
 */
import type { SpecOp } from "./gen/ops";
import type { Node, UISpec } from "./gen/uispec";
import { PathError, setPath } from "./path";

export type ReducerCode =
  | "invalid_op"
  | "unknown_component"
  | "invalid_props"
  | "unknown_slot"
  | "slot_type_not_allowed"
  | "slot_overflow"
  | "unknown_action_slot"
  | "node_not_found"
  | "dangling_ref"
  | "budget_exceeded"
  | "binding_not_bindable"
  | "unresolved_binding"
  | "path_not_settable"
  | "cycle";

export class ReducerError extends Error {
  constructor(
    public readonly code: ReducerCode,
    message: string,
    public readonly nodeId?: string,
  ) {
    super(nodeId ? `${code} (${nodeId}): ${message}` : `${code}: ${message}`);
  }
}

export function emptySpec(): UISpec {
  return { spec_version: 1, root: null, nodes: {}, data: {}, actions: {} };
}

type Nodes = UISpec["nodes"];

function normalizeNode(n: Node): Node {
  return { ...n, props: n.props ?? {}, slots: n.slots ?? {}, actions: n.actions ?? {} };
}

export function applyOp(spec: UISpec, op: SpecOp): UISpec {
  switch (op.op) {
    case "add_node":
      return { ...spec, nodes: { ...spec.nodes, [op.id]: normalizeNode(op.node) } };
    case "set_props": {
      const n = spec.nodes[op.id];
      if (!n) throw new ReducerError("node_not_found", "set_props on missing node", op.id);
      return { ...spec, nodes: { ...spec.nodes, [op.id]: { ...n, props: { ...(n.props ?? {}), ...op.props } } } };
    }
    case "set_slot": {
      const n = spec.nodes[op.id];
      if (!n) throw new ReducerError("node_not_found", "set_slot on missing node", op.id);
      return {
        ...spec,
        nodes: { ...spec.nodes, [op.id]: { ...n, slots: { ...(n.slots ?? {}), [op.slot]: [...op.children] } } },
      };
    }
    case "set_data": {
      if (op.path === undefined) {
        if (typeof op.value !== "object" || op.value === null || Array.isArray(op.value)) {
          throw new ReducerError("invalid_op", "set_data without path requires an object value");
        }
        return { ...spec, data: { ...spec.data, ...(op.value as Record<string, unknown>) } };
      }
      try {
        return { ...spec, data: setPath(spec.data, op.path, op.value) };
      } catch (e) {
        if (e instanceof PathError) throw new ReducerError(e.code, e.message);
        throw e;
      }
    }
    case "set_action":
      return { ...spec, actions: { ...spec.actions, [op.id]: op.action } };
    case "remove_node":
      return removeNode(spec, op.id);
    case "set_root":
      return { ...spec, root: op.id };
    case "clear":
      return op.all ? { ...spec, nodes: {}, root: null, data: {}, actions: {} } : { ...spec, nodes: {}, root: null };
    case "done":
      return spec;
    default: {
      const unknown = op as { op?: string };
      throw new ReducerError("invalid_op", `unsupported op ${String(unknown.op)}`);
    }
  }
}

function removeNode(spec: UISpec, id: string): UISpec {
  if (!(id in spec.nodes)) return spec;
  const doomed = new Set<string>();
  const mark = (cur: string) => {
    if (doomed.has(cur)) return;
    const n = spec.nodes[cur];
    if (!n) return;
    doomed.add(cur);
    for (const children of Object.values(n.slots ?? {})) for (const c of children ?? []) mark(c);
  };
  mark(id);
  const nodes: Nodes = {};
  for (const [nid, n] of Object.entries(spec.nodes)) {
    if (doomed.has(nid)) continue;
    let changed = false;
    const slots: NonNullable<Node["slots"]> = {};
    for (const [slot, children] of Object.entries(n.slots ?? {})) {
      const kept = (children ?? []).filter((c) => !doomed.has(c));
      if (kept.length !== (children ?? []).length) changed = true;
      slots[slot] = kept;
    }
    nodes[nid] = changed ? { ...n, slots } : n;
  }
  const root = spec.root !== null && doomed.has(spec.root) ? null : spec.root;
  return { ...spec, nodes, root };
}

/** Applies ops in order; throws on the first failure. */
export function applyOps(spec: UISpec, ops: readonly SpecOp[]): UISpec {
  return ops.reduce(applyOp, spec);
}

/**
 * Canonical JSON for golden comparisons: sorted keys, empty
 * props/slots/actions and `pinned: false` omitted, undefined dropped.
 */
export function canonical(spec: UISpec): string {
  const nodes: Record<string, unknown> = {};
  for (const id of Object.keys(spec.nodes).sort()) {
    const n = spec.nodes[id];
    const out: Record<string, unknown> = { type: n.type };
    if (n.props && Object.keys(n.props).length) out.props = n.props;
    if (n.slots && Object.keys(n.slots).length) out.slots = n.slots;
    if (n.actions && Object.keys(n.actions).length) out.actions = n.actions;
    if (n.ttl_ms !== undefined) out.ttl_ms = n.ttl_ms;
    if (n.pinned) out.pinned = true;
    nodes[id] = out;
  }
  return stableStringify({
    spec_version: spec.spec_version,
    root: spec.root,
    nodes,
    data: spec.data,
    actions: spec.actions,
  });
}

export function stableStringify(v: unknown): string {
  if (v === undefined) return "null";
  if (v === null || typeof v !== "object") return JSON.stringify(v);
  if (Array.isArray(v)) return "[" + v.map(stableStringify).join(",") + "]";
  const obj = v as Record<string, unknown>;
  const keys = Object.keys(obj)
    .filter((k) => obj[k] !== undefined)
    .sort();
  return "{" + keys.map((k) => JSON.stringify(k) + ":" + stableStringify(obj[k])).join(",") + "}";
}
