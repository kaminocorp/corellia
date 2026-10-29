import { useMemo, useState } from "react";

import { catalog, emptySpec, applyOps, type SpecOp } from "../contract";
import { Renderer } from "../renderer/Renderer";

/** `?gallery=1`: every content component rendered from its catalog example. */
export function Gallery() {
  const [log, setLog] = useState<string[]>([]);
  const spec = useMemo(() => {
    const ops: SpecOp[] = [{ op: "add_node", id: "grid", node: { type: "Grid", props: { columns: 3, gap: "lg" }, slots: { children: [] } } }];
    const children: string[] = [];
    for (const [name, def] of Object.entries(catalog.components)) {
      if (def.category === "layout" || !def.example) continue;
      const card = `card_${name}`;
      const node = `ex_${name}`;
      children.push(card);
      ops.push({ op: "add_node", id: card, node: { type: "Card", props: { title: name, subtitle: def.description }, slots: { body: [node] } } });
      const actions: Record<string, { id: string; label: string; hotkey?: string }> = {};
      for (const slot of def.actions ?? []) {
        const id = `${name}_${slot}`;
        actions[slot] = { id, label: slot, hotkey: slot === "confirm" ? "enter" : slot === "reject" ? "escape" : undefined };
        ops.push({ op: "set_action", id, action: { kind: "dismiss", target: card } });
      }
      ops.push({ op: "add_node", id: node, node: { type: name, props: def.example as Record<string, unknown>, actions } });
    }
    ops.push({ op: "set_slot", id: "grid", slot: "children", children });
    ops.push({ op: "set_root", id: "grid" });
    return applyOps(emptySpec(), ops);
  }, []);
  return (
    <main className="h-full w-full overflow-auto p-6">
      <h1 className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Component gallery</h1>
      <Renderer spec={spec} fire={(a, n) => setLog((l) => [...l, `${a} on ${n}`])} onInvalid={(n, m) => setLog((l) => [...l, `invalid ${n}: ${m}`])} />
      {log.length > 0 && <pre className="mt-6 font-mono text-xs text-muted-foreground">{log.join("\n")}</pre>}
    </main>
  );
}
