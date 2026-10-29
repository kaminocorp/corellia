import type { ConnectionStatus } from "../session/store";

const LABEL: Record<ConnectionStatus, string> = {
  connecting: "connecting",
  online: "online",
  reconnecting: "reconnecting",
  offline: "offline",
  unauthorized: "unauthorized",
  forbidden: "refused",
};

export function ConnectionIndicator({ status, devMode }: { status: ConnectionStatus; devMode?: boolean }) {
  const online = status === "online";
  return (
    <span className="flex items-center gap-2" data-testid="connection">
      <span
        aria-hidden
        className={
          "inline-block h-2 w-2 rounded-full " +
          (online ? "bg-primary animate-telemetry" : status === "offline" || status === "unauthorized" || status === "forbidden" ? "bg-destructive" : "bg-state-thinking animate-telemetry")
        }
      />
      <span>
        {LABEL[status]}
        {online && devMode ? " · dev" : ""}
      </span>
    </span>
  );
}
