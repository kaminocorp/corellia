import type { ConnectionStatus } from "../session/store";

/** Visible across the room when the backend is unreachable. */
export function OfflineBanner({ status }: { status: ConnectionStatus }) {
  if (status === "online" || status === "connecting") return null;
  return (
    <div className="absolute top-14 left-1/2 -translate-x-1/2 border border-destructive/60 bg-card/90 px-4 py-2 font-mono text-xs tracking-[0.2em] text-destructive uppercase" role="status">
      {status === "reconnecting" ? "connection lost · reconnecting" : "backend unreachable"}
    </div>
  );
}
