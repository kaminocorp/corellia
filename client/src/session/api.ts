import type { CancelRequest, TurnRequest, TurnResponse } from "../contract";
import { authHeaders } from "./auth";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

async function postJSON<T>(url: string, body: unknown, fetchImpl: typeof fetch = fetch): Promise<T> {
  const res = await fetchImpl(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = null;
  }
  if (!res.ok) {
    const err = (parsed ?? {}) as { error?: string; code?: string };
    throw new ApiError(res.status, err.code ?? "http_error", err.error ?? `HTTP ${res.status}`);
  }
  return parsed as T;
}

export function sendTurn(text: string, source: "keyboard" | "voice" = "keyboard", fetchImpl?: typeof fetch) {
  const body: TurnRequest = { text, source };
  return postJSON<TurnResponse>("/api/turn", body, fetchImpl);
}

export function cancelTurn(turnId?: string, fetchImpl?: typeof fetch) {
  const body: CancelRequest = turnId ? { turn_id: turnId } : {};
  return postJSON<{ cancelled: boolean }>("/api/turn/cancel", body, fetchImpl);
}
