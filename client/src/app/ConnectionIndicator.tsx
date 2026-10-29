import type { Health } from "../session/health";

export function ConnectionIndicator({ health }: { health: Health | null }) {
  const online = health?.ok === true;
  return (
    <span className="flex items-center gap-2" data-testid="connection">
      <span
        aria-hidden
        className={
          "inline-block h-2 w-2 rounded-full " +
          (online ? "bg-primary animate-telemetry" : "bg-destructive")
        }
      />
      <span>{online ? `online${health?.dev_mode ? " · dev" : ""}` : "offline"}</span>
    </span>
  );
}
