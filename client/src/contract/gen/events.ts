/* eslint-disable */
/**
 * Generated from shared/schema/events.schema.json by scripts/contracts-generate.sh. DO NOT EDIT.
 */

/**
 * Events on the server-to-client stream (SSE). Every event has `type`, a monotonically increasing `seq` used for replay, and `ts`. Turn-scoped events carry `turn_id`.
 */
export type SessionEvent =
  | SessionEventSnapshot
  | StateEvent
  | TextDeltaEvent
  | SpecOpEvent
  | SpeechEvent
  | ProposalEvent
  | ToolCallEvent
  | ToolResultEvent
  | TurnStartedEvent
  | TurnDoneEvent
  | ErrorEvent
  | ProactiveEvent
  | HeartbeatEvent;
/**
 * Sent first on every (re)connect: the full current state so the client can render without replay.
 */
export type SessionEventSnapshot = Base & {
  type: "session";
  session_id: string;
  agent_name?: string;
  agent_state: AgentState;
  spec: UISpec;
  pending_proposals: Proposal[];
  capabilities: Capabilities;
  transcript?: TranscriptEntry[];
  [k: string]: unknown;
};
export type TurnId = string;
/**
 * The 3D agent's presentation state.
 */
export type AgentState = "idle" | "listening" | "thinking" | "speaking" | "error";
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
export type StateEvent = Base & {
  type: "state";
  state: AgentState;
  detail?: string;
  [k: string]: unknown;
};
/**
 * A chunk of the agent's textual reply for the transcript.
 */
export type TextDeltaEvent = Base & {
  type: "text_delta";
  delta: string;
  [k: string]: unknown;
};
/**
 * A validated spec op. The client applies it with the shared reducer.
 */
export type SpecOpEvent = Base & {
  type: "spec_op";
  op: SpecOp;
  modality?: Modality;
  [k: string]: unknown;
};
/**
 * Incremental spec operations streamed from the backend to the client (VISION.md section 5.4). The client applies them to its local spec through a reducer; the server validates each against the catalog before forwarding.
 */
export type SpecOp =
  AddNodeOp | SetPropsOp | SetSlotOp | SetDataOp | SetActionOp | RemoveNodeOp | SetRootOp | ClearOp | DoneOp;
/**
 * How the decision layer chose to surface a reply.
 */
export type Modality = "none" | "voice" | "glance" | "visual" | "both";
/**
 * Text the decision layer chose to say aloud, in sentence-sized pieces. `audio_url` is set when a server TTS provider rendered it; otherwise the client synthesises.
 */
export type SpeechEvent = Base & {
  type: "speech";
  text: string;
  audio_url?: string;
  final?: boolean;
  [k: string]: unknown;
};
/**
 * A proposed side effect awaiting confirmation (VISION.md 5.6). `status` moves pending -> confirmed|rejected|expired.
 */
export type ProposalEvent = Base & {
  type: "proposal";
  proposal: Proposal;
  status: "pending" | "confirmed" | "rejected" | "expired" | "executed" | "failed";
  [k: string]: unknown;
};
export type ToolCallEvent = Base & {
  type: "tool_call";
  call_id: string;
  tool: string;
  args: {
    [k: string]: unknown;
  };
  [k: string]: unknown;
};
export type ToolResultEvent = Base & {
  type: "tool_result";
  call_id: string;
  tool: string;
  ok: boolean;
  summary?: string;
  error?: string;
  [k: string]: unknown;
};
export type TurnStartedEvent = Base & {
  type: "turn_started";
  text: string;
  source: "keyboard" | "voice" | "proactive" | "action";
  [k: string]: unknown;
};
export type TurnDoneEvent = Base & {
  type: "turn_done";
  status: "completed" | "cancelled" | "failed";
  /**
   * The full reply text for the transcript.
   */
  text?: string;
  modality?: Modality;
  [k: string]: unknown;
};
/**
 * A failure or a rejected op. Named `session_error` on the wire because an SSE event named `error` is delivered to EventSource.onerror as a connection error (review 2026-10-30, item 1).
 */
export type ErrorEvent = Base & {
  type: "session_error";
  code: string;
  message: string;
  fatal?: boolean;
  [k: string]: unknown;
};
/**
 * Something the agent put on screen unprompted (reminder, ambient card). The accompanying spec ops and speech follow as normal events with the same turn_id.
 */
export type ProactiveEvent = Base & {
  type: "proactive";
  source: "reminder" | "ambient" | "runtime";
  title: string;
  [k: string]: unknown;
};
export type HeartbeatEvent = Base & {
  type: "heartbeat";
  [k: string]: unknown;
};

export interface Base {
  seq: number;
  ts: string;
  turn_id?: TurnId;
  [k: string]: unknown;
}
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
export interface Proposal {
  id: string;
  tool: string;
  args: {
    [k: string]: unknown;
  };
  label: string;
  detail?: string;
  risk: "low" | "medium" | "high";
  expires_at: string;
  [k: string]: unknown;
}
export interface Capabilities {
  runtime: string;
  streaming: boolean;
  ui_ops: boolean;
  tools?: boolean;
  cancel?: boolean;
  /**
   * Server STT provider name, or `none` (client falls back to browser recognition).
   */
  stt: string;
  /**
   * Server TTS provider name, or `none` (client falls back to speechSynthesis).
   */
  tts: string;
  [k: string]: unknown;
}
export interface TranscriptEntry {
  role: "user" | "agent" | "system";
  text: string;
  ts: string;
  turn_id?: TurnId;
  source?: "keyboard" | "voice" | "proactive" | "action";
  /**
   * True for the apology of a failed turn: shown and spoken, but left out of the history the model sees.
   */
  failed?: boolean;
  [k: string]: unknown;
}
/**
 * Insert or replace a node. Children referenced in slots may arrive later.
 */
export interface AddNodeOp {
  op: "add_node";
  id: string;
  node: Node;
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
