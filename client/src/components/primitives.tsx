import type { ReactNode } from "react";

import { ACCENT } from "./styles";
import type { ResolvedAction } from "./types";

export function Label({ children }: { children: ReactNode }) {
  return <div className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">{children}</div>;
}

export function Panel({ children, accent = "none", className = "" }: { children: ReactNode; accent?: string; className?: string }) {
  return (
    <section className={`border bg-card/80 p-4 backdrop-blur-sm ${ACCENT[accent] ?? ACCENT.none} ${className}`}>{children}</section>
  );
}

const KEY_LABEL: Record<string, string> = { enter: "Enter", escape: "Esc" };

/**
 * Keyboard affordances for a node's actions, never click targets. An action
 * without a key (a confirm on a card below the top one: voice, or Enter once
 * it reaches the top) shows its label alone, not an empty key cap (review
 * 2026-10-30 round 3).
 */
export function ActionBar({ actions, fire }: { actions: ResolvedAction[]; fire: (id: string) => void }) {
  if (actions.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-3 font-mono text-xs" role="group" aria-label="Actions">
      {actions.map((a) => (
        <span key={a.id} className="flex items-center gap-2 text-muted-foreground" data-action={a.id} onClick={() => fire(a.id)}>
          {a.hotkey ? <kbd className="border border-border px-1.5 py-0.5 text-foreground">{KEY_LABEL[a.hotkey] ?? a.hotkey}</kbd> : null}
          <span>{a.label}</span>
        </span>
      ))}
    </div>
  );
}
