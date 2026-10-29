/**
 * The SSE connection. The browser's EventSource reconnects on its own for
 * network failures and resends Last-Event-ID, so replay is free. It gives
 * up for good on any non-200 response (a 401 for a wrong token, a 500 from
 * a proxy while the backend restarts), so when it reports CLOSED we probe
 * the API once to tell "unauthorized" from "unreachable" and reconnect
 * ourselves with backoff. Every event is validated against the contract
 * before dispatch; `onEvent` sees only events the store had not seen
 * before, so a reconnect's replay cannot re-trigger speech.
 */
import { isSessionEvent } from "../contract";
import type { SessionEvent } from "../contract";
import { authHeaders, withToken } from "./auth";
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
  /** Resolves to the HTTP status of a probe request (default: GET /api/config). */
  probe?: () => Promise<number>;
  /** Backoff bounds in ms. */
  minDelayMs?: number;
  maxDelayMs?: number;
};

const CLOSED = 2;

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

/** Exponential backoff with a cap; exported for tests. */
export function backoffDelay(attempt: number, min = 1000, max = 30_000): number {
  return Math.min(max, min * 2 ** Math.max(0, attempt));
}

export class SessionStream {
  private es: EventSource | null = null;
  private everOpened = false;
  private attempts = 0;
  private timer: number | null = null;
  private stopped = false;

  constructor(
    private readonly store: SessionStore,
    private readonly opts: StreamOptions = {},
  ) {}

  connect(): void {
    this.disconnect();
    this.stopped = false;
    const base = this.opts.url ?? "/api/events";
    const url = withToken(base);
    const es = this.opts.factory ? this.opts.factory(url) : new EventSource(url);
    this.es = es;
    this.store.setConnection(this.everOpened ? "reconnecting" : "connecting");
    es.onopen = () => {
      this.everOpened = true;
      this.attempts = 0;
      this.store.setConnection("online");
    };
    es.onerror = () => {
      if (this.es !== es) return;
      if (es.readyState === CLOSED) {
        void this.recover();
        return;
      }
      // The browser is retrying by itself (server sent `retry: 2000`).
      this.store.setConnection(this.everOpened ? "reconnecting" : "offline");
    };
    const handler = (e: MessageEvent<string>) => {
      const ev = parseEvent(e.data);
      if (!ev) {
        this.store.addError("off_contract_event", `dropped an event that failed validation: ${e.data.slice(0, 120)}`);
        return;
      }
      const before = this.store.getState().lastSeq;
      this.store.dispatch(ev);
      if (ev.type === "session" || ev.seq > before) this.opts.onEvent?.(ev);
    };
    for (const t of EVENT_TYPES) es.addEventListener(t, handler as EventListener);
  }

  /** The browser gave up: find out why, then retry or wait for a new token. */
  private async recover(): Promise<void> {
    this.es?.close();
    this.es = null;
    let status = 0;
    try {
      status = await (this.opts.probe ?? defaultProbe)();
    } catch {
      status = 0;
    }
    if (this.stopped) return;
    if (status === 401 || status === 403) {
      this.store.setConnection("unauthorized");
      return;
    }
    this.store.setConnection(this.everOpened ? "reconnecting" : "offline");
    const delay = backoffDelay(this.attempts++, this.opts.minDelayMs, this.opts.maxDelayMs);
    this.timer = window.setTimeout(() => {
      this.timer = null;
      if (!this.stopped) this.connect();
    }, delay);
  }

  disconnect(): void {
    this.stopped = true;
    if (this.timer !== null) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.es) {
      this.es.close();
      this.es = null;
    }
  }
}

async function defaultProbe(): Promise<number> {
  const res = await fetch("/api/config", { headers: authHeaders(), cache: "no-store" });
  return res.status;
}
