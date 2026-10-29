import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { sessionStore, initialState } from "../session/store";
import { resetDeviceTokenCache } from "../session/auth";

/**
 * Mounts the real App with a fake EventSource and fetch: the regression
 * test for the blank display (review 2026-10-29, item 1). React 19 looped
 * on an unstable useSyncExternalStore snapshot and unmounted the tree.
 */
class FakeEventSource {
  static instances: FakeEventSource[] = [];
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSED = 2;
  readyState = 0;
  onopen: (() => void) | null = null;
  onerror: (() => void) | null = null;
  listeners = new Map<string, EventListener[]>();
  constructor(public url: string) {
    FakeEventSource.instances.push(this);
  }
  addEventListener(type: string, l: EventListener) {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), l]);
  }
  removeEventListener() {}
  emit(type: string, data: unknown) {
    for (const l of this.listeners.get(type) ?? []) l({ data: JSON.stringify(data) } as unknown as Event);
  }
  close() {
    this.readyState = 2;
  }
}

const snapshot = {
  type: "session",
  seq: 3,
  ts: "2026-10-29T10:00:00Z",
  session_id: "s1",
  agent_name: "Corellia",
  agent_state: "idle",
  spec: { spec_version: 1, root: null, nodes: {}, actions: {}, data: {} },
  pending_proposals: [],
  capabilities: { runtime: "local", streaming: true, ui_ops: true, stt: "none", tts: "none" },
  transcript: [],
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("App", () => {
  const originalEventSource = globalThis.EventSource;
  const calls: string[] = [];

  beforeEach(() => {
    calls.length = 0;
    FakeEventSource.instances = [];
    (globalThis as unknown as { EventSource: unknown }).EventSource = FakeEventSource;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        calls.push(`${init?.method ?? "GET"} ${url}`);
        if (url.endsWith("/healthz")) return jsonResponse({ ok: true, version: "t", commit: "c", dev_mode: true, time: "" });
        if (url.endsWith("/api/voice/capabilities")) return jsonResponse({ stt: "none", tts: "none", mode: "toggle" });
        if (url.endsWith("/api/turn")) return jsonResponse({ turn_id: "t1", handled: "turn" }, 202);
        return jsonResponse({ ok: true });
      }),
    );
    window.history.replaceState({}, "", "/");
    resetDeviceTokenCache();
    // Fresh state between tests (the module-level store persists).
    act(() => {
      Object.assign(sessionStore, { state: initialState() });
      sessionStore.setConnection("connecting");
    });
  });
  afterEach(() => {
    (globalThis as unknown as { EventSource: unknown }).EventSource = originalEventSource;
    vi.unstubAllGlobals();
  });

  it("renders the display and stays mounted while the stream delivers events", async () => {
    const { App } = await import("./App");
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<App />);
    const input = screen.getByLabelText("Message");
    expect(input).toBeInTheDocument();
    expect(input).toHaveFocus();
    expect(FakeEventSource.instances).toHaveLength(1);
    const es = FakeEventSource.instances[0];
    act(() => {
      es.onopen?.();
      es.emit("session", snapshot);
    });
    expect(screen.getByTestId("connection")).toHaveTextContent("online");
    expect(screen.getByTestId("runtime")).toHaveTextContent("local demo");
    act(() => {
      es.emit("turn_started", { type: "turn_started", seq: 4, ts: "2026-10-29T10:00:01Z", turn_id: "t1", text: "hello", source: "keyboard" });
      es.emit("state", { type: "state", seq: 5, ts: "2026-10-29T10:00:01Z", state: "thinking", turn_id: "t1" });
      es.emit("text_delta", { type: "text_delta", seq: 6, ts: "2026-10-29T10:00:01Z", turn_id: "t1", delta: "Hi there" });
    });
    expect(screen.getByTestId("agent-state")).toHaveTextContent("thinking");
    expect(screen.getByText("Hi there")).toBeInTheDocument();
    act(() => {
      es.emit("spec_op", {
        type: "spec_op",
        seq: 7,
        ts: "2026-10-29T10:00:02Z",
        turn_id: "t1",
        op: { op: "add_node", id: "s", node: { type: "Status", props: { text: "all good", level: "ok" } } },
      });
      es.emit("spec_op", { type: "spec_op", seq: 8, ts: "2026-10-29T10:00:02Z", turn_id: "t1", op: { op: "set_root", id: "s" } });
      es.emit("turn_done", { type: "turn_done", seq: 9, ts: "2026-10-29T10:00:03Z", turn_id: "t1", status: "completed", text: "Hi there", modality: "text" });
      es.emit("state", { type: "state", seq: 10, ts: "2026-10-29T10:00:03Z", state: "idle", turn_id: "t1" });
    });
    expect(screen.getByText("all good")).toBeInTheDocument();
    expect(screen.getByTestId("agent-state")).toHaveTextContent("idle");
    expect(screen.getByLabelText("Message")).toBeInTheDocument();
    const loops = errors.mock.calls.filter((c) => String(c[0]).includes("Maximum update depth") || String(c[0]).includes("getSnapshot should be cached"));
    expect(loops).toHaveLength(0);
    errors.mockRestore();
  });

  it("sends a typed message and surfaces a failed turn outside debug mode", async () => {
    const { App } = await import("./App");
    render(<App />);
    const es = FakeEventSource.instances[0];
    act(() => {
      es.onopen?.();
      es.emit("session", snapshot);
    });
    const input = screen.getByLabelText("Message");
    fireEvent.change(input, { target: { value: "what time is it" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(calls).toContain("POST /api/turn");
    act(() => {
      es.emit("error", { type: "error", seq: 4, ts: "2026-10-29T10:00:01Z", turn_id: "t1", code: "runtime", message: "upstream HTTP 500", fatal: true });
    });
    expect(screen.getByTestId("error-line")).toHaveTextContent("runtime: upstream HTTP 500");
  });

  it("shows the token prompt when the stream is refused and reconnects with the typed token", async () => {
    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/healthz")) return jsonResponse({ ok: true, version: "t", commit: "c", dev_mode: false, time: "" });
      if (url.endsWith("/api/voice/capabilities")) return jsonResponse({ stt: "none", tts: "none", mode: "toggle" });
      if (url.endsWith("/api/config")) return jsonResponse({ error: "unauthorized" }, 401);
      return jsonResponse({ ok: true });
    });
    const { App } = await import("./App");
    render(<App />);
    const es = FakeEventSource.instances[0];
    await act(async () => {
      es.readyState = 2;
      es.onerror?.();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByRole("status")).toHaveTextContent("device token rejected");
    const field = screen.getByLabelText("Device token");
    fireEvent.change(field, { target: { value: "0123456789abcdef0123456789abcdef" } });
    fireEvent.keyDown(field, { key: "Enter" });
    expect(FakeEventSource.instances).toHaveLength(2);
    expect(FakeEventSource.instances[1].url).toContain("token=0123456789abcdef0123456789abcdef");
    window.localStorage.clear();
  });
});
