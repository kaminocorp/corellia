/**
 * The SSE connection. The browser's EventSource reconnects on its own and
 * resends Last-Event-ID, so replay is free; we only track status and
 * validate every event against the contract before dispatching it.
 */
import { isSessionEvent } from "../contract";
import type { SessionEvent } from "../contract";
import { withToken } from "./auth";
import type { SessionStore } from "./store";

export const EVENT_TYPES = [
  "session",
  "state",
  "turn_started",
  "text_delta",
  "spec_op",
  "speech",
  "proposal",
  "tool_call",
  "tool_result",
  "turn_done",
  "error",
  "proactive",
  "heartbeat",
] as const;

export type StreamOptions = {
  url?: string;
  /** For tests: a factory producing an EventSource-like object. */
  factory?: (url: string) => EventSource;
  onEvent?: (ev: SessionEvent) => void;
};

/** Parses one SSE `data` payload; returns null when it is not a valid event. */
export function parseEvent(data: string): SessionEvent | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(data);
  } catch {
    return null;
  }
  return isSessionEvent(parsed) ? parsed : null;
}

export class SessionStream {
  private es: EventSource | null = null;
  private everOpened = false;

  constructor(
    private readonly store: SessionStore,
    private readonly opts: StreamOptions = {},
  ) {}

  connect(): void {
    this.disconnect();
    const base = this.opts.url ?? "/api/events";
    const url = withToken(base);
    const es = this.opts.factory ? this.opts.factory(url) : new EventSource(url);
    this.es = es;
    this.store.setConnection(this.everOpened ? "reconnecting" : "connecting");
    es.onopen = () => {
      this.everOpened = true;
      this.store.setConnection("online");
    };
    es.onerror = () => {
      // EventSource keeps retrying by itself (server sent `retry: 2000`).
      this.store.setConnection(this.everOpened ? "reconnecting" : "offline");
    };
    const handler = (e: MessageEvent<string>) => {
      const ev = parseEvent(e.data);
      if (!ev) {
        this.store.addError("off_contract_event", `dropped an event that failed validation: ${e.data.slice(0, 120)}`);
        return;
      }
      this.store.dispatch(ev);
      this.opts.onEvent?.(ev);
    };
    for (const t of EVENT_TYPES) es.addEventListener(t, handler as EventListener);
  }

  disconnect(): void {
    if (this.es) {
      this.es.close();
      this.es = null;
    }
  }
}
