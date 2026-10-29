import type { ConnectionStatus } from "../session/store";

const TEXT: Partial<Record<ConnectionStatus, string>> = {
  reconnecting: "connection lost · reconnecting",
  offline: "backend unreachable",
  unauthorized: "device token rejected",
};

/** Visible across the room when the backend is unreachable or refuses the token. */
export function OfflineBanner({ status }: { status: ConnectionStatus }) {
  const text = TEXT[status];
  if (!text) return null;
  return (
    <div className="absolute top-14 left-1/2 -translate-x-1/2 border border-destructive/60 bg-card/90 px-4 py-2 font-mono text-xs tracking-[0.2em] text-destructive uppercase" role="status">
      {text}
    </div>
  );
}
