import { authHeaders } from "../session/auth";

export type VoiceCapabilities = { stt: string; tts: string; tts_format?: string; mode: "toggle" | "ptt"; barge_in?: "auto" | "off" };

export async function fetchVoiceCapabilities(fetchImpl: typeof fetch = fetch): Promise<VoiceCapabilities> {
  try {
    const res = await fetchImpl("/api/voice/capabilities", { headers: authHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = (await res.json()) as Partial<VoiceCapabilities>;
    return { stt: body.stt ?? "none", tts: body.tts ?? "none", tts_format: body.tts_format, mode: body.mode === "ptt" ? "ptt" : "toggle", barge_in: body.barge_in === "off" ? "off" : "auto" };
  } catch {
    return { stt: "none", tts: "none", mode: "toggle" };
  }
}
