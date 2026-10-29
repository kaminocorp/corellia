/**
 * Catalog-aware checks for ops and whole specs. Mirrors
 * backend/internal/uispec/validate.go; error codes are identical.
 */
import type { SlotDef } from "./gen/catalog";
import type { SpecOp } from "./gen/ops";
import type { Node, UISpec } from "./gen/uispec";
import { isBinding, resolveProps } from "./path";
import { component, validateOp, validateProps } from "./registry";
import type { ReducerCode } from "./reducer";

export const MAX_NODES = 64;
export const MAX_DEPTH = 8;

export type Issue = { code: ReducerCode; nodeId?: string; message: string };

/** Pre-apply check. Returns null when the op may be applied. */
export function checkOp(spec: UISpec, op: SpecOp): Issue | null {
  const schema = validateOp(op);
  if (!schema.ok) return { code: "invalid_op", message: schema.message };
  switch (op.op) {
    case "add_node":
      return checkNode(spec, op.id, op.node);
    case "set_props": {
      const n = spec.nodes[op.id];
      if (!n) return { code: "node_not_found", nodeId: op.id, message: "set_props on missing node" };
      return checkProps(op.id, n.type, { ...(n.props ?? {}), ...op.props });
    }
    case "set_slot": {
      const n = spec.nodes[op.id];
      if (!n) return { code: "node_not_found", nodeId: op.id, message: "set_slot on missing node" };
      return checkSlot(spec, op.id, n.type, op.slot, op.children);
    }
    case "set_data":
      if (op.path === undefined && (typeof op.value !== "object" || op.value === null || Array.isArray(op.value))) {
        return { code: "invalid_op", message: "set_data without path requires an object value" };
      }
      return null;
    default:
      return null;
  }
}

function checkNode(spec: UISpec, id: string, n: Node): Issue | null {
  const def = component(n.type);
  if (!def) return { code: "unknown_component", nodeId: id, message: `component ${JSON.stringify(n.type)} is not in the catalog` };
  for (const [slot, children] of Object.entries(n.slots ?? {})) {
    const issue = checkSlot(spec, id, n.type, slot, children ?? []);
    if (issue) return issue;
  }
  for (const actionSlot of Object.keys(n.actions ?? {})) {
    if (!(def.actions ?? []).includes(actionSlot)) {
      return { code: "unknown_action_slot", nodeId: id, message: `${n.type} has no action slot ${JSON.stringify(actionSlot)}` };
    }
  }
  return checkProps(id, n.type, n.props ?? {});
}

function checkSlot(spec: UISpec, id: string, type: string, slot: string, children: readonly string[]): Issue | null {
  const def = component(type);
  const sd = def?.slots?.[slot];
  if (!sd) return { code: "unknown_slot", nodeId: id, message: `${type} has no slot ${JSON.stringify(slot)}` };
  if (sd.max !== undefined && children.length > sd.max) {
    return { code: "slot_overflow", nodeId: id, message: `slot ${JSON.stringify(slot)} holds at most ${sd.max} children` };
  }
  for (const c of children) {
    const child = spec.nodes[c];
    if (!child) continue;
    if (!slotAccepts(sd, child.type)) {
      return { code: "slot_type_not_allowed", nodeId: id, message: `slot ${JSON.stringify(slot)} does not accept ${child.type}` };
    }
  }
  return null;
}

function checkProps(id: string, type: string, props: Record<string, unknown>): Issue | null {
  const def = component(type);
  const bound = new Set<string>();
  for (const [k, v] of Object.entries(props)) {
    if (isBinding(v)) {
      if (!(def?.bindable ?? []).includes(k)) {
        return { code: "binding_not_bindable", nodeId: id, message: `prop ${JSON.stringify(k)} of ${type} does not accept a binding` };
      }
      bound.add(k);
    }
  }
  const r = validateProps(type, props, bound);
  if (!r.ok) return { code: "invalid_props", nodeId: id, message: r.message };
  return null;
}

/** Whole-spec validation; returns every issue found. */
export function checkSpec(spec: UISpec): Issue[] {
  const issues: Issue[] = [];
  const add = (code: ReducerCode, nodeId: string | undefined, message: string) => issues.push({ code, nodeId, message });

  const ids = Object.keys(spec.nodes).sort();
  if (ids.length > MAX_NODES) add("budget_exceeded", undefined, `${ids.length} nodes exceed the budget of ${MAX_NODES}`);
  if (spec.root !== null && !(spec.root in spec.nodes)) add("dangling_ref", spec.root, "root node does not exist");

  for (const id of ids) {
    const n = spec.nodes[id];
    const def = component(n.type);
    if (!def) {
      add("unknown_component", id, `component ${JSON.stringify(n.type)} is not in the catalog`);
      continue;
    }
    for (const slot of Object.keys(n.slots ?? {}).sort()) {
      const sd = def.slots?.[slot];
      if (!sd) {
        add("unknown_slot", id, `${n.type} has no slot ${JSON.stringify(slot)}`);
        continue;
      }
      for (const c of n.slots?.[slot] ?? []) {
        const child = spec.nodes[c];
        if (!child) {
          add("dangling_ref", id, `slot ${JSON.stringify(slot)} references missing node ${JSON.stringify(c)}`);
          continue;
        }
        if (!slotAccepts(sd, child.type)) add("slot_type_not_allowed", id, `slot ${JSON.stringify(slot)} does not accept ${child.type}`);
      }
    }
    for (const a of Object.keys(n.actions ?? {}).sort()) {
      const ref = n.actions?.[a];
      if (ref && !(ref.id in spec.actions)) {
        add("dangling_ref", id, `action slot ${JSON.stringify(a)} references missing action ${JSON.stringify(ref.id)}`);
      }
    }
    const { resolved, unresolved } = resolveProps(n.props ?? {}, spec.data);
    for (const k of unresolved) add("unresolved_binding", id, `prop ${JSON.stringify(k)} binding does not resolve`);
    if (unresolved.length === 0) {
      const r = validateProps(n.type, resolved);
      if (!r.ok) add("invalid_props", id, r.message);
    }
  }

  if (spec.root !== null && spec.root in spec.nodes) {
    const { depth, cycle } = walkDepth(spec, spec.root, new Set());
    if (cycle) add("cycle", cycle, "node is reachable from itself");
    else if (depth > MAX_DEPTH) add("budget_exceeded", spec.root, `tree depth ${depth} exceeds ${MAX_DEPTH}`);
  }
  return issues;
}

function walkDepth(spec: UISpec, id: string, onPath: Set<string>): { depth: number; cycle: string | null } {
  if (onPath.has(id)) return { depth: 0, cycle: id };
  const n = spec.nodes[id];
  if (!n) return { depth: 0, cycle: null };
  onPath.add(id);
  let max = 0;
  for (const children of Object.values(n.slots ?? {})) {
    for (const c of children ?? []) {
      const r = walkDepth(spec, c, onPath);
      if (r.cycle) {
        onPath.delete(id);
        return r;
      }
      if (r.depth > max) max = r.depth;
    }
  }
  onPath.delete(id);
  return { depth: max + 1, cycle: null };
}

function slotAccepts(sd: SlotDef, type: string): boolean {
  return sd.accepts.some((a) => a === "*" || a === type);
}
