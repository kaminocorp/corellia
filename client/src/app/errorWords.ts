import type { ClientError } from "../session/store";

/**
 * Failures that have no other place on the screen, in plain words. A
 * failed turn is already an apology in the transcript and a status card,
 * and a rejected op is routine (the model is told and repairs it), so
 * neither shows on the error line (review 2026-10-30 round 3, item 4).
 * Anything not listed is for the debug pane and the log.
 */
const PLAIN: Record<string, string> = {
  send_failed: "That didn't send. Check the connection and try again.",
  action_failed: "That action didn't go through.",
  clear_failed: "The screen couldn't be cleared.",
  agent3d: "The 3D agent stopped; showing the still one instead.",
};

/** What the error line says for an error outside debug mode, or null for nothing. */
export function plainWords(err: ClientError): string | null {
  return PLAIN[err.code] ?? null;
}
