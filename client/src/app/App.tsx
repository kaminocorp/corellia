import { useEffect, useState } from "react";

import { CommandInput } from "./CommandInput";
import { ConnectionIndicator } from "./ConnectionIndicator";
import { fetchHealth, type Health } from "../session/health";

/**
 * Phase 1 shell: a black full-screen page with the always-focused command
 * input and a connection indicator. Later phases mount the 3D agent, the
 * generated-UI renderer, the transcript and the mic indicator here.
 */
export function App() {
  const [health, setHealth] = useState<Health | null>(null);
  const [lastLine, setLastLine] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      const h = await fetchHealth();
      if (!cancelled) setHealth(h);
    };
    void tick();
    const id = window.setInterval(tick, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return (
    <main className="relative flex h-full w-full flex-col items-center justify-center">
      <header className="absolute top-4 left-5 flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
        <span>Corellia</span>
        <ConnectionIndicator health={health} />
      </header>

      <section className="flex flex-col items-center gap-6">
        <div
          aria-hidden
          className="h-40 w-40 rounded-full border border-border opacity-60"
          style={{ boxShadow: "0 0 80px hsl(142 71% 45% / 0.15) inset" }}
        />
        <p className="font-mono text-sm text-muted-foreground">{lastLine || "Type and press Enter."}</p>
      </section>

      <footer className="absolute bottom-6 w-full max-w-3xl px-6">
        <CommandInput onSubmit={(text) => setLastLine(`You said: ${text}`)} />
      </footer>
    </main>
  );
}
