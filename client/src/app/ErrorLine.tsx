import { useEffect, useState } from "react";

import { useSessionState, type ClientError } from "../session/store";
import { plainWords } from "./errorWords";

const SHOW_MS = 12_000;

/**
 * The most recent error, for a few seconds. Outside `?debug=1` it shows
 * only client-side failures, in plain words; with it, every error as
 * `code: message` with the raw detail (a provider's URL and JSON body
 * belong there and in the log, not on the always-on screen). It is a row
 * of its own in the footer, above the transcript, so it never covers the
 * last transcript line (review 2026-10-30, item 8).
 */
export function ErrorLine({ debug = false, showMs = SHOW_MS }: { debug?: boolean; showMs?: number }) {
  const last = useSessionState<ClientError | undefined>((s) => s.errors[s.errors.length - 1]);
  // The error that has timed out; a newer one is visible until its own timer fires.
  const [expired, setExpired] = useState<ClientError | null>(null);
  useEffect(() => {
    if (!last) return;
    const t = window.setTimeout(() => setExpired(last), showMs);
    return () => window.clearTimeout(t);
  }, [last, showMs]);
  const visible = last && last !== expired ? last : null;
  if (!visible) return null;
  const text = debug ? `${visible.code}: ${visible.message}` : plainWords(visible);
  if (!text) return null;
  return (
    <div className="mb-2 truncate font-mono text-xs text-destructive" role="status" data-testid="error-line" data-code={visible.code}>
      {text}
    </div>
  );
}
