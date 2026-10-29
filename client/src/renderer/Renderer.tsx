import { Fragment, useMemo, type ReactNode } from "react";

import { registry } from "../components/registry";
import type { ResolvedAction } from "../components/types";
import type { UISpec } from "../contract";
import { assignHotkeys, resolveNode } from "./resolve";

type Props = {
  spec: UISpec;
  fire: (actionId: string, nodeId: string) => void;
  /** Reports nodes that failed validation (debug pane). */
  onInvalid?: (nodeId: string, message: string) => void;
};

/** Renders the spec tree from its root. Nothing renders unless it validates. */
export function Renderer({ spec, fire, onInvalid }: Props) {
  const hotkeys = useMemo(() => assignHotkeys(spec), [spec]);
  if (!spec.root) return null;
  return <NodeView id={spec.root} spec={spec} hotkeys={hotkeys} fire={fire} onInvalid={onInvalid} depth={0} />;
}

type NodeProps = Props & { id: string; hotkeys: Map<string, ResolvedAction>; depth: number };

function NodeView({ id, spec, hotkeys, fire, onInvalid, depth }: NodeProps): ReactNode {
  const node = spec.nodes[id];
  if (!node || depth > 8) return null;
  const impl = registry[node.type];
  if (!impl) return null;
  const resolved = resolveNode(node, spec.data);
  if (resolved.status === "invalid") {
    onInvalid?.(id, resolved.message);
    return null;
  }
  if (resolved.status === "pending") return null;
  const slot = (name: string): ReactNode => (
    <>
      {(node.slots?.[name] ?? []).map((child) => (
        <Fragment key={child}>
          <NodeView id={child} spec={spec} hotkeys={hotkeys} fire={fire} onInvalid={onInvalid} depth={depth + 1} />
        </Fragment>
      ))}
    </>
  );
  const actions = Object.values(node.actions ?? {})
    .map((ref) => (ref ? hotkeys.get(ref.id) : undefined))
    .filter((a): a is ResolvedAction => !!a && a.nodeId === id);
  return (
    <div data-node={id} data-type={node.type} className="contents">
      {impl({ id, node, props: resolved.props, slot, actions, fire: (actionId) => fire(actionId, id) })}
    </div>
  );
}
