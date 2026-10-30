/* eslint-disable */
/**
 * Generated from shared/schema/ops.schema.json by scripts/contracts-generate.sh. DO NOT EDIT.
 */

/**
 * Incremental spec operations streamed from the backend to the client (VISION.md section 5.4). The client applies them to its local spec through a reducer; the server validates each against the catalog before forwarding.
 */
export type SpecOp =
  AddNodeOp | SetPropsOp | SetSlotOp | SetDataOp | SetActionOp | RemoveNodeOp | SetRootOp | ClearOp | DoneOp;
/**
 * A typed action record. `propose` goes through the confirm gate; `tool` runs a read-only tool directly; `navigate` switches the focused panel; `dismiss` removes a node; `send_message` sends text as a user turn.
 */
export type Action = {
  [k: string]: unknown;
} & {
  kind: "propose" | "tool" | "navigate" | "dismiss" | "send_message";
  tool?: string;
  args?: {
    [k: string]: unknown;
  };
  target?: string;
  message?: string;
  risk?: "low" | "medium" | "high";
};

/**
 * Insert or replace a node. Children referenced in slots may arrive later.
 */
export interface AddNodeOp {
  op: "add_node";
  id: string;
  node: Node;
}
export interface Node {
  /**
   * A component name from the catalog.
   */
  type: string;
  /**
   * Component props. Each value is a literal or a Binding. Validated against the component's props schema from the catalog.
   */
  props?: {
    [k: string]: unknown;
  };
  /**
   * Named slots to ordered child node ids.
   */
  slots?: {
    /**
     * @maxItems 64
     */
    [k: string]: string[];
  };
  /**
   * Action slots exposed by the component (for example `primary`) bound to action records.
   */
  actions?: {
    [k: string]: ActionRef;
  };
  /**
   * Decay: the client removes the node this many milliseconds after it was last touched. Absent means no decay.
   */
  ttl_ms?: number;
  /**
   * Hint for the decision layer: pinned nodes are re-emitted after a `clear` issued by the replace policy. The reducer itself treats pinned and unpinned nodes alike.
   */
  pinned?: boolean;
}
export interface ActionRef {
  id: string;
  label: string;
  /**
   * Optional keyboard hint. The renderer assigns digits 1-9 when absent.
   */
  hotkey?: string;
}
/**
 * Shallow-merge props into an existing node.
 */
export interface SetPropsOp {
  op: "set_props";
  id: string;
  props: {
    [k: string]: unknown;
  };
}
/**
 * Replace the ordered children of a slot on an existing node.
 */
export interface SetSlotOp {
  op: "set_slot";
  id: string;
  slot: string;
  /**
   * @maxItems 64
   */
  children: string[];
}
/**
 * Write into the data object. Without `path`, `value` must be an object and is shallow-merged into the root. With `path`, `value` is set at that path, creating intermediate objects.
 */
export interface SetDataOp {
  op: "set_data";
  path?: string;
  value: unknown;
}
/**
 * Insert or replace a spec-level action record.
 */
export interface SetActionOp {
  op: "set_action";
  id: string;
  action: Action;
}
/**
 * Remove a node and its slot descendants, and drop it from any parent's slot.
 */
export interface RemoveNodeOp {
  op: "remove_node";
  id: string;
}
/**
 * Set the root node. The node may arrive later in the same stream.
 */
export interface SetRootOp {
  op: "set_root";
  id: string;
}
/**
 * Remove every node and reset the root. With `all: true` the data object and action records are cleared too; otherwise they are kept so a follow-up can rebuild the tree over the same data.
 */
export interface ClearOp {
  op: "clear";
  all?: boolean;
}
/**
 * Marks the end of a spec stream for this turn. Carries no change; the server runs whole-spec checks (dangling refs, budget) when it sees it.
 */
export interface DoneOp {
  op: "done";
}
