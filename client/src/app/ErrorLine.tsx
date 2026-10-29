import { useEffect, useState } from "react";

import { useSessionState, type ClientError } from "../session/store";

const SHOW_MS = 12_000;

/**
 * The most recent error, visible without `?debug=1` for a few seconds:
 * a failed turn, a rejected send, a dropped op. A silent failure looks
 * like the agent ignoring the owner (review 2026-10-29, item 5). It is a
 * row of its own in the footer, above the transcript, so it never covers
 * the last transcript line (review 2026-10-30, item 8).
 */
export function ErrorLine({ showMs = SHOW_MS }: { showMs?: number }) {
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
  return (
    <div className="mb-2 truncate font-mono text-xs text-destructive" role="status" data-testid="error-line">
      {visible.code}: {visible.message}
    </div>
  );
}
