/* eslint-disable */
/**
 * Generated from shared/schema/ui-spec.schema.json by scripts/contracts-generate.sh. DO NOT EDIT.
 */

/**
 * A component name from the catalog.
 */
export type ComponentType = string;
export type NodeId = string;
export type ActionId = string;
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
  target?: NodeId;
  message?: string;
  risk?: "low" | "medium" | "high";
};

/**
 * A UI spec: a flat map of typed nodes referenced by id, composed through named slots, with data bindings and action records. VISION.md section 5.2.
 */
export interface UISpec {
  spec_version: 1;
  /**
   * Id of the root node, or null when nothing is on screen.
   */
  root: string | null;
  nodes: {
    [k: string]: Node;
  };
  /**
   * Data object that bindings resolve against.
   */
  data: {
    [k: string]: unknown;
  };
  actions: {
    [k: string]: Action;
  };
}
export interface Node {
  type: ComponentType;
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
    [k: string]: NodeId[];
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
  id: ActionId;
  label: string;
  /**
   * Optional keyboard hint. The renderer assigns digits 1-9 when absent.
   */
  hotkey?: string;
}
