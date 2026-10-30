import { describe, expect, it } from "vitest";

import { SessionStore } from "./store";
import { EVENT_TYPES, parseEvent, SessionStream } from "./stream";

class FakeEventSource {
  static instances: FakeEventSource[] = [];
  onopen: (() => void) | null = null;
  onerror: (() => void) | null = null;
  listeners = new Map<string, EventListener[]>();
  closed = false;
  constructor(public url: string) {
    FakeEventSource.instances.push(this);
  }
  addEventListener(type: string, l: EventListener) {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), l]);
  }
  emit(type: string, data: string) {
    for (const l of this.listeners.get(type) ?? []) l({ data } as unknown as Event);
  }
  close() {
    this.closed = true;
  }
}

describe("parseEvent", () => {
  it("accepts contract events and rejects everything else", () => {
    expect(parseEvent(JSON.stringify({ type: "heartbeat", seq: 1, ts: "2026-10-29T10:00:00Z" }))?.type).toBe("heartbeat");
    expect(parseEvent(JSON.stringify({ type: "heartbeat" }))).toBeNull();
    expect(parseEvent("{not json")).toBeNull();
    expect(parseEvent(JSON.stringify({ type: "nope", seq: 1, ts: "2026-10-29T10:00:00Z" }))).toBeNull();
  });
});

describe("SessionStream", () => {
  it("dispatches validated events and tracks connection status", () => {
    const store = new SessionStore();
    const stream = new SessionStream(store, { factory: (url) => new FakeEventSource(url) as unknown as EventSource });
    stream.connect();
    const es = FakeEventSource.instances.at(-1)!;
    expect(es.url).toBe("/api/events");
    expect(store.getState().connection).toBe("connecting");
    es.onopen?.();
    expect(store.getState().connection).toBe("online");
    for (const t of EVENT_TYPES) expect(es.listeners.has(t)).toBe(true);
    es.emit("state", JSON.stringify({ type: "state", seq: 1, ts: "2026-10-29T10:00:00Z", state: "thinking" }));
    expect(store.getState().agentState).toBe("thinking");
    es.emit("state", "garbage");
    expect(store.getState().errors.at(-1)?.code).toBe("off_contract_event");
    es.onerror?.();
    expect(store.getState().connection).toBe("reconnecting");
    stream.disconnect();
    expect(es.closed).toBe(true);
  });
});

describe("SessionStream and the EventSource error channel (review 2026-10-30, item 1)", () => {
  const base = { seq: 2, ts: "2026-10-29T10:00:00Z" };
  it("a server session_error event reaches the store and leaves the connection online", () => {
    const store = new SessionStore();
    const stream = new SessionStream(store, { factory: (url) => new FakeEventSource(url) as unknown as EventSource });
    stream.connect();
    const es = FakeEventSource.instances.at(-1)!;
    es.onopen?.();
    es.emit("session_error", JSON.stringify({ type: "session_error", ...base, code: "runtime", message: "upstream 404", fatal: true }));
    expect(store.getState().errors.at(-1)?.message).toBe("upstream 404");
    expect(store.getState().connection).toBe("online");
    stream.disconnect();
  });

  it("a MessageEvent delivered to onerror is not a connection error", () => {
    const store = new SessionStore();
    const stream = new SessionStream(store, { factory: (url) => new FakeEventSource(url) as unknown as EventSource });
    stream.connect();
    const es = FakeEventSource.instances.at(-1)!;
    es.onopen?.();
    // What browsers do with a server event named `error`: dispatch it to onerror too.
    (es.onerror as unknown as (e: unknown) => void)?.({ data: JSON.stringify({ type: "heartbeat", ...base }) });
    expect(store.getState().connection).toBe("online");
    stream.disconnect();
  });

  it("a plain Event on a named listener neither throws nor records an error", () => {
    const store = new SessionStore();
    const stream = new SessionStream(store, { factory: (url) => new FakeEventSource(url) as unknown as EventSource });
    stream.connect();
    const es = FakeEventSource.instances.at(-1)!;
    es.onopen?.();
    for (const l of es.listeners.get("session_error") ?? []) l({ type: "error" } as unknown as Event);
    expect(store.getState().errors).toEqual([]);
    expect(store.getState().connection).toBe("online");
    stream.disconnect();
  });

  it("a 403 from the probe is a refused request, not a token problem", async () => {
    const { vi } = await import("vitest");
    vi.useFakeTimers();
    try {
      const store = new SessionStore();
      const stream = new SessionStream(store, { factory: (url) => new FakeEventSource(url) as unknown as EventSource, probe: async () => 403 });
      stream.connect();
      const es = FakeEventSource.instances.at(-1)!;
      (es as unknown as { readyState: number }).readyState = 2;
      es.onerror?.();
      await vi.advanceTimersByTimeAsync(0);
      expect(store.getState().connection).toBe("forbidden");
      stream.disconnect();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("SessionStream recovery", () => {
  const snapshot = (seq: number) =>
    JSON.stringify({
      type: "session",
      seq,
      ts: "2026-10-29T10:00:00Z",
      session_id: "s",
      agent_name: "C",
      agent_state: "idle",
      spec: { spec_version: 1, root: null, nodes: {}, actions: {}, data: {} },
      pending_proposals: [],
      capabilities: { runtime: "local", streaming: true, ui_ops: true, stt: "none", tts: "none" },
      transcript: [],
    });

  it("forwards only events newer than the snapshot, so a replay cannot re-speak", () => {
    const store = new SessionStore();
    const seen: string[] = [];
    const stream = new SessionStream(store, { factory: (url) => new FakeEventSource(url) as unknown as EventSource, onEvent: (ev) => seen.push(`${ev.type}:${ev.seq}`) });
    stream.connect();
    const es = FakeEventSource.instances.at(-1)!;
    es.emit("session", snapshot(10));
    es.emit("speech", JSON.stringify({ type: "speech", seq: 4, ts: "2026-10-29T10:00:00Z", text: "old reply", final: true }));
    es.emit("speech", JSON.stringify({ type: "speech", seq: 10, ts: "2026-10-29T10:00:00Z", text: "also old", final: true }));
    es.emit("speech", JSON.stringify({ type: "speech", seq: 11, ts: "2026-10-29T10:00:00Z", text: "new", final: true }));
    expect(seen).toEqual(["session:10", "speech:11"]);
  });

  it("probes the API when the browser gives up: 401 becomes unauthorized, otherwise it reconnects with backoff", async () => {
    const { vi } = await import("vitest");
    vi.useFakeTimers();
    try {
      const store = new SessionStore();
      let status = 401;
      const stream = new SessionStream(store, {
        factory: (url) => new FakeEventSource(url) as unknown as EventSource,
        probe: async () => status,
        minDelayMs: 100,
        maxDelayMs: 400,
      });
      stream.connect();
      let es = FakeEventSource.instances.at(-1)!;
      (es as unknown as { readyState: number }).readyState = 2;
      es.onerror?.();
      await vi.advanceTimersByTimeAsync(0);
      expect(store.getState().connection).toBe("unauthorized");
      expect(es.closed).toBe(true);
      const before = FakeEventSource.instances.length;
      await vi.advanceTimersByTimeAsync(10_000);
      expect(FakeEventSource.instances.length).toBe(before); // waits for a token, no retry storm

      status = 500;
      stream.connect();
      es = FakeEventSource.instances.at(-1)!;
      (es as unknown as { readyState: number }).readyState = 2;
      es.onerror?.();
      await vi.advanceTimersByTimeAsync(0);
      expect(store.getState().connection).toBe("offline");
      await vi.advanceTimersByTimeAsync(100);
      expect(FakeEventSource.instances.length).toBe(before + 2);
      es = FakeEventSource.instances.at(-1)!;
      (es as unknown as { readyState: number }).readyState = 2;
      es.onerror?.();
      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(199);
      expect(FakeEventSource.instances.length).toBe(before + 2); // second wait is 200ms
      await vi.advanceTimersByTimeAsync(1);
      expect(FakeEventSource.instances.length).toBe(before + 3);
      stream.disconnect();
    } finally {
      vi.useRealTimers();
    }
  });
});
