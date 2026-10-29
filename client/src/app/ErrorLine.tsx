import { useEffect, useState } from "react";

import { useSessionState, type ClientError } from "../session/store";

const SHOW_MS = 12_000;

/**
 * The most recent error, visible without `?debug=1` for a few seconds:
 * a failed turn, a rejected send, a dropped op. A silent failure looks
 * like the agent ignoring the owner (review 2026-10-29, item 5).
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
    <div className="absolute bottom-28 left-1/2 w-full max-w-3xl -translate-x-1/2 truncate px-6 font-mono text-xs text-destructive" role="status" data-testid="error-line">
      {visible.code}: {visible.message}
    </div>
  );
}
