import type { ConnectionStatus } from "../session/store";

const TEXT: Partial<Record<ConnectionStatus, string>> = {
  reconnecting: "connection lost · reconnecting",
  offline: "backend unreachable",
  unauthorized: "device token rejected",
  forbidden: "request refused · check the page's origin and host",
};

/**
 * Visible across the room when the backend is unreachable or refuses the
 * token. It sits in the top bar between the header and the mic indicator,
 * where no generated UI is placed (glance overlays start below the bar, the
 * panel and full zones lower still), so it never covers the model's output.
 */
export function OfflineBanner({ status }: { status: ConnectionStatus }) {
  const text = TEXT[status];
  if (!text) return null;
  return (
    <div className="absolute top-3 left-1/2 max-w-[50vw] -translate-x-1/2 truncate border border-destructive/60 bg-card/90 px-4 py-1.5 font-mono text-xs tracking-[0.2em] text-destructive uppercase" role="status">
      {text}
    </div>
  );
}
