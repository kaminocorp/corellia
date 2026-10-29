import type { ActionRequest, CancelRequest, TurnRequest, TurnResponse } from "../contract";
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

export function fireAction(actionId: string, nodeId?: string, fetchImpl?: typeof fetch) {
  const body: ActionRequest = nodeId ? { action_id: actionId, node_id: nodeId } : { action_id: actionId };
  return postJSON<{ ok: boolean }>("/api/action", body, fetchImpl);
}

export function clearScreen(fetchImpl?: typeof fetch) {
  return postJSON<{ ok: boolean }>("/api/screen/clear", {}, fetchImpl);
}

export function removeNode(nodeId: string, fetchImpl?: typeof fetch) {
  return postJSON<{ ok: boolean }>("/api/screen/remove", { node_id: nodeId }, fetchImpl);
}

/** POST /api/voice/stt with raw audio; the server answers 501 when no provider is configured. */
export async function transcribe(audio: Blob, mime: string, fetchImpl: typeof fetch = fetch): Promise<{ text: string }> {
  const res = await fetchImpl("/api/voice/stt", { method: "POST", headers: { "Content-Type": mime || "audio/webm", ...authHeaders() }, body: audio });
  const body = (await res.json().catch(() => ({}))) as { text?: string; error?: string; code?: string };
  if (!res.ok) throw new ApiError(res.status, body.code ?? "http_error", body.error ?? `HTTP ${res.status}`);
  return { text: body.text ?? "" };
}

/** POST /api/voice/tts; resolves to encoded audio bytes. */
export async function synthesize(text: string, signal?: AbortSignal, fetchImpl: typeof fetch = fetch): Promise<ArrayBuffer> {
  const res = await fetchImpl("/api/voice/tts", { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify({ text }), signal });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
    throw new ApiError(res.status, body.code ?? "http_error", body.error ?? `HTTP ${res.status}`);
  }
  return res.arrayBuffer();
}
