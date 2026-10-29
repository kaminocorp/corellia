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
