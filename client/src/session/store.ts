/**
 * Client-side session state: a reducer over stream events plus a tiny
 * external store for React (useSyncExternalStore). The spec is advanced
 * with the shared reducer; invalid ops are reported, never rendered.
 */
import { useRef, useSyncExternalStore } from "react";

import { applyOp, emptySpec, ReducerError } from "../contract";
import type { AgentState, Capabilities, Proposal, SessionEvent, SpecOp, TranscriptEntry, UISpec } from "../contract";

export type ConnectionStatus = "connecting" | "online" | "reconnecting" | "offline" | "unauthorized" | "forbidden";

export type ClientError = { code: string; message: string; ts: string; turnId?: string };

export type SessionState = {
  connection: ConnectionStatus;
  sessionId: string;
  agentName: string;
  agentState: AgentState;
  spec: UISpec;
  lastSeq: number;
  transcript: TranscriptEntry[];
  activeTurnId: string | null;
  streamingText: string;
  pendingProposals: Proposal[];
  capabilities: Capabilities | null;
  errors: ClientError[];
  recentEvents: SessionEvent[];
  /** Node id -> epoch ms of its last add/set, for decay. */
  touched: Record<string, number>;
  /** Speech pieces heard outside a turn (confirm results, reminders), joined into a transcript entry on the final piece. */
  pendingSpeech: string[];
  /**
   * Server status outside the session (phase 17): whether the data
   * directory is taking writes, and whether a kiosk is connected to the
   * same backend (from the heartbeat exchange). `storeError` is the
   * reason while writes fail, null when they succeed.
   */
  storeError: string | null;
  kioskConnected: boolean;
};

export const MAX_ERRORS = 20;
export const MAX_RECENT = 60;
export const MAX_TRANSCRIPT = 200;

export function initialState(): SessionState {
  return {
    connection: "connecting",
    sessionId: "",
    agentName: "Corellia",
    agentState: "idle",
    spec: emptySpec(),
    lastSeq: 0,
    transcript: [],
    activeTurnId: null,
    streamingText: "",
    pendingProposals: [],
    capabilities: null,
    errors: [],
    recentEvents: [],
    touched: {},
    pendingSpeech: [],
    storeError: null,
    kioskConnected: false,
  };
}

/** True when two values are the same object or have the same own enumerable entries (one level deep). */
export function shallowEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  const ka = Object.keys(a as object);
  const kb = Object.keys(b as object);
  if (ka.length !== kb.length) return false;
  for (const k of ka) {
    if (!Object.prototype.hasOwnProperty.call(b, k) || !Object.is((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])) return false;
  }
  return true;
}

/** Updates the touched map for an op (pure). */
export function touch(touched: Record<string, number>, op: SpecOp, at: number): Record<string, number> {
  switch (op.op) {
    case "add_node":
    case "set_props":
    case "set_slot":
      return { ...touched, [op.id]: at };
    case "remove_node": {
      if (!(op.id in touched)) return touched;
      const copy = { ...touched };
      delete copy[op.id];
      return copy;
    }
    case "clear":
      return {};
    default:
      return touched;
  }
}

const tail = <T>(arr: T[], max: number): T[] => (arr.length > max ? arr.slice(arr.length - max) : arr);

/** Pure reducer. Events with seq <= lastSeq (replayed duplicates) are ignored except snapshots. */
export function reduce(state: SessionState, ev: SessionEvent): SessionState {
  if (ev.type === "session") {
    return {
      ...state,
      sessionId: ev.session_id,
      agentName: ev.agent_name ?? state.agentName,
      agentState: ev.agent_state,
      spec: ev.spec,
      lastSeq: ev.seq,
      transcript: tail(ev.transcript ?? [], MAX_TRANSCRIPT),
      pendingProposals: ev.pending_proposals,
      capabilities: ev.capabilities,
      // Nodes the client already knew keep their timestamps so decay timers
      // do not restart on every reconnect; new ones count from the snapshot.
      touched: Object.fromEntries(Object.keys(ev.spec.nodes).map((id) => [id, state.touched[id] ?? (Date.parse(ev.ts) || Date.now())])),
      activeTurnId: ev.agent_state === "idle" ? null : state.activeTurnId,
      streamingText: ev.agent_state === "idle" ? "" : state.streamingText,
      // Speech heard before the reconnect cannot be completed by what follows.
      pendingSpeech: [],
      recentEvents: tail([...state.recentEvents, ev], MAX_RECENT),
    };
  }
  if (ev.seq <= state.lastSeq) return state;
  const next: SessionState = { ...state, lastSeq: ev.seq, recentEvents: tail([...state.recentEvents, ev], MAX_RECENT) };
  switch (ev.type) {
    case "turn_started":
      next.transcript = tail(
        [...state.transcript, { role: "user", text: ev.text, ts: ev.ts, turn_id: ev.turn_id, source: ev.source }],
        MAX_TRANSCRIPT,
      );
      next.activeTurnId = ev.turn_id ?? null;
      next.streamingText = "";
      next.pendingSpeech = [];
      return next;
    case "state":
      next.agentState = ev.state;
      return next;
    case "text_delta":
      if (state.activeTurnId && ev.turn_id !== state.activeTurnId) return next;
      next.streamingText = state.streamingText + ev.delta;
      return next;
    case "spec_op":
      try {
        next.spec = applyOp(state.spec, ev.op);
        next.touched = touch(state.touched, ev.op, Date.parse(ev.ts) || Date.now());
      } catch (e) {
        const code = e instanceof ReducerError ? e.code : "reducer";
        next.errors = tail([...state.errors, { code, message: String(e), ts: ev.ts, turnId: ev.turn_id }], MAX_ERRORS);
      }
      return next;
    case "turn_done": {
      const text = ev.text ?? state.streamingText;
      // A snapshot taken between the server's transcript append and its
      // turn_done already holds this reply; do not add it twice.
      const last = state.transcript[state.transcript.length - 1];
      const dup = !!last && last.role === "agent" && !!ev.turn_id && last.turn_id === ev.turn_id;
      if (text && !dup) {
        next.transcript = tail([...state.transcript, { role: "agent", text, ts: ev.ts, turn_id: ev.turn_id }], MAX_TRANSCRIPT);
      }
      next.activeTurnId = null;
      next.streamingText = "";
      return next;
    }
    case "session_error":
      next.errors = tail([...state.errors, { code: ev.code, message: ev.message, ts: ev.ts, turnId: ev.turn_id }], MAX_ERRORS);
      // A persist failure stays on screen until the server says the store
      // writes again (the heartbeat exchange clears it).
      if (ev.code === "persist") next.storeError = ev.message;
      return next;
    case "proposal": {
      const others = state.pendingProposals.filter((p) => p.id !== ev.proposal.id);
      next.pendingProposals = ev.status === "pending" ? [...others, ev.proposal] : others;
      return next;
    }
    case "speech": {
      // Inside a turn the reply reaches the transcript on turn_done. Outside
      // one (a confirmed action's result, a reminder) speech is the only
      // text there is, so it is recorded here, final piece by final piece.
      if (state.activeTurnId) return next;
      const pieces = [...state.pendingSpeech, ev.text];
      if (ev.final) {
        next.pendingSpeech = [];
        next.transcript = tail([...state.transcript, { role: "agent", text: pieces.join(" "), ts: ev.ts, turn_id: ev.turn_id }], MAX_TRANSCRIPT);
      } else {
        next.pendingSpeech = pieces;
      }
      return next;
    }
    default:
      return next;
  }
}

type Listener = () => void;

export class SessionStore {
  private state: SessionState;
  private listeners = new Set<Listener>();

  constructor(state: SessionState = initialState()) {
    this.state = state;
  }

  getState = (): SessionState => this.state;

  subscribe = (l: Listener): (() => void) => {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  };

  dispatch(ev: SessionEvent): void {
    const next = reduce(this.state, ev);
    if (next !== this.state) this.set(next);
  }

  setConnection(connection: ConnectionStatus): void {
    if (connection !== this.state.connection) this.set({ ...this.state, connection });
  }

  /** The heartbeat exchange's answer: kiosk connected, store writing. */
  setServerStatus(s: { kioskConnected: boolean; storeOk: boolean }): void {
    const storeError = s.storeOk ? null : (this.state.storeError ?? "the data directory is not taking writes");
    if (s.kioskConnected === this.state.kioskConnected && storeError === this.state.storeError) return;
    this.set({ ...this.state, kioskConnected: s.kioskConnected, storeError });
  }

  /** Applies an op the client itself issues (decay, dismiss) ahead of the server's echo. */
  applyLocal(op: SpecOp): void {
    try {
      const spec = applyOp(this.state.spec, op);
      this.set({ ...this.state, spec, touched: touch(this.state.touched, op, Date.now()) });
    } catch (e) {
      this.addError("local_op", String(e));
    }
  }

  addError(code: string, message: string): void {
    this.set({ ...this.state, errors: tail([...this.state.errors, { code, message, ts: new Date().toISOString() }], MAX_ERRORS) });
  }

  private set(next: SessionState) {
    this.state = next;
    for (const l of this.listeners) l();
  }
}

export const sessionStore = new SessionStore();

/**
 * Subscribes a component to a slice of the session state. The selector may
 * return a fresh object: the result is cached per state version and, when a
 * new result is shallow-equal to the previous one, the previous object is
 * returned. useSyncExternalStore requires a stable snapshot; a selector that
 * returned a new object every call made React 19 loop until it gave up with
 * "Maximum update depth exceeded" and left the page blank (review 2026-10-29).
 */
export function useSessionState<T = SessionState>(
  selector: (s: SessionState) => T = (s) => s as unknown as T,
  isEqual: (a: T, b: T) => boolean = shallowEqual,
  store: SessionStore = sessionStore,
): T {
  const cache = useRef<{ state: SessionState; value: T } | null>(null);
  const getSnapshot = () => {
    const state = store.getState();
    const c = cache.current;
    if (c && c.state === state) return c.value;
    const value = selector(state);
    if (c && isEqual(c.value, value)) {
      cache.current = { state, value: c.value };
      return c.value;
    }
    cache.current = { state, value };
    return value;
  };
  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}
