import type { ConnectionStatus } from "../session/store";

/**
 * The backend is up but cannot write its data directory: memory, reminders
 * and the transcript are being lost (the Docker volume owned by root, a
 * full disk). It used to be a log line per turn and nothing on screen
 * (review 2026-10-30 round 5). Same place as the offline banner, which
 * takes precedence when the connection itself is the problem.
 */
export function StoreBanner({ error, connection }: { error: string | null; connection: ConnectionStatus }) {
  if (!error || (connection !== "online" && connection !== "connecting")) return null;
  return (
    <div
      className="absolute top-3 left-1/2 max-w-[60vw] -translate-x-1/2 truncate border border-destructive/60 bg-card/90 px-4 py-1.5 font-mono text-xs tracking-[0.2em] text-destructive uppercase"
      role="alert"
      data-testid="store-banner"
      title={error}
    >
      can't save · memory and reminders are being lost · check the data directory
    </div>
  );
}
