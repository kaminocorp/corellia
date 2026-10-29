import { describe, expect, it } from "vitest";

import type { SessionEvent } from "../contract";
import { initialState, reduce, SessionStore } from "./store";

const ts = "2026-10-29T10:00:00Z";
let seq = 0;
const ev = <T extends SessionEvent["type"]>(type: T, body: Omit<Extract<SessionEvent, { type: T }>, "type" | "seq" | "ts">) =>
  ({ type, seq: ++seq, ts, ...body }) as unknown as SessionEvent;

const snapshot = (over: Partial<Extract<SessionEvent, { type: "session" }>> = {}) =>
  ev("session", {
    session_id: "main",
    agent_name: "Corellia",
    agent_state: "idle",
    spec: { spec_version: 1, root: null, nodes: {}, data: {}, actions: {} },
    pending_proposals: [],
    capabilities: { runtime: "local", streaming: true, ui_ops: true, stt: "none", tts: "none" },
    transcript: [],
    ...over,
  });

describe("session reducer", () => {
  it("adopts a snapshot and ignores already-seen seqs", () => {
    seq = 10;
    let s = reduce(initialState(), snapshot());
    expect(s.lastSeq).toBe(11);
    expect(s.capabilities?.runtime).toBe("local");
    const stale = { ...ev("state", { state: "thinking" }), seq: 5 } as SessionEvent;
    s = reduce(s, stale);
    expect(s.agentState).toBe("idle");
  });

  it("runs a turn: started, deltas, ops, done", () => {
    seq = 0;
    let s = reduce(initialState(), snapshot());
    s = reduce(s, ev("turn_started", { turn_id: "t1", text: "hi", source: "keyboard" }));
    expect(s.activeTurnId).toBe("t1");
    expect(s.transcript).toHaveLength(1);
    s = reduce(s, ev("text_delta", { turn_id: "t1", delta: "Hel" }));
    s = reduce(s, ev("text_delta", { turn_id: "t1", delta: "lo" }));
    expect(s.streamingText).toBe("Hello");
    s = reduce(s, ev("spec_op", { op: { op: "add_node", id: "n1", node: { type: "Status", props: { text: "x" } } } }));
    s = reduce(s, ev("spec_op", { op: { op: "set_root", id: "n1" } }));
    expect(s.spec.root).toBe("n1");
    s = reduce(s, ev("turn_done", { turn_id: "t1", status: "completed", text: "Hello" }));
    expect(s.activeTurnId).toBeNull();
    expect(s.streamingText).toBe("");
    expect(s.transcript.map((e) => e.role)).toEqual(["user", "agent"]);
  });

  it("records reducer failures as errors instead of throwing", () => {
    seq = 0;
    let s = reduce(initialState(), snapshot());
    s = reduce(s, ev("spec_op", { op: { op: "set_props", id: "missing", props: {} } }));
    expect(s.errors[0]?.code).toBe("node_not_found");
    expect(s.spec.nodes).toEqual({});
  });

  it("tracks proposals by status", () => {
    seq = 0;
    const p = { id: "p1", tool: "set_reminder", args: {}, label: "Remind", risk: "low" as const, expires_at: ts };
    let s = reduce(initialState(), snapshot());
    s = reduce(s, ev("proposal", { proposal: p, status: "pending" }));
    expect(s.pendingProposals).toHaveLength(1);
    s = reduce(s, ev("proposal", { proposal: p, status: "confirmed" }));
    expect(s.pendingProposals).toHaveLength(0);
  });

  it("ignores deltas from a turn that is not active", () => {
    seq = 0;
    let s = reduce(initialState(), snapshot());
    s = reduce(s, ev("turn_started", { turn_id: "t2", text: "x", source: "voice" }));
    s = reduce(s, ev("text_delta", { turn_id: "t1", delta: "late" }));
    expect(s.streamingText).toBe("");
  });
});

describe("SessionStore", () => {
  it("notifies listeners only on change", () => {
    const store = new SessionStore();
    let calls = 0;
    store.subscribe(() => calls++);
    store.setConnection("connecting"); // unchanged from initial
    expect(calls).toBe(0);
    store.setConnection("online");
    expect(calls).toBe(1);
    seq = 0;
    store.dispatch(snapshot());
    expect(calls).toBe(2);
    expect(store.getState().sessionId).toBe("main");
  });
});
