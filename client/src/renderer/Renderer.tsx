import { Fragment, useEffect, useMemo, type ReactNode } from "react";

import { OVERLAY_ANCHOR, OverlayStack } from "../components/overlayStack";
import { registry } from "../components/registry";
import type { ResolvedAction } from "../components/types";
import type { UISpec } from "../contract";
import { ABOVE_FOOTER } from "./footer";
import { assignHotkeys, overlayGroups, resolveNode } from "./resolve";

type Props = {
  spec: UISpec;
  fire: (actionId: string, nodeId: string) => void;
  /** Reports nodes that failed validation (debug pane). */
  onInvalid?: (nodeId: string, message: string) => void;
  /**
   * What to render: the root tree, the floating overlay groups (and a
   * glance root), or both (the gallery). The Stage renders the two layers
   * apart so overlays anchor to the screen, not to the scrolling zone.
   */
  layer?: "all" | "root" | "overlays";
};

/**
 * Renders the spec tree from its root plus floating overlays. Nothing
 * renders unless it validates. Floating overlays that share an anchor are
 * laid out in one column there (a glance root, reply card, status card,
 * reminder, clock), instead of each sitting on the others; the anchor
 * depends on the root's placement (overlayAnchor), so cards never cover a
 * full visual or a panel.
 */
export function Renderer({ spec, fire, onInvalid, layer = "all" }: Props) {
  const hotkeys = useMemo(() => assignHotkeys(spec), [spec]);
  const groups = useMemo(() => overlayGroups(spec), [spec]);
  const rootIsOverlay = !!spec.root && spec.nodes[spec.root]?.type === "Overlay";
  return (
    <>
      {layer !== "overlays" && spec.root && !rootIsOverlay && <NodeView key={spec.root} id={spec.root} spec={spec} hotkeys={hotkeys} fire={fire} onInvalid={onInvalid} depth={0} />}
      {layer !== "root" &&
        groups.map(({ position, ids }) => (
          <div
            key={position}
            data-overlay-group={position}
            className={`pointer-events-auto absolute flex flex-col gap-3 ${OVERLAY_ANCHOR[position] ?? OVERLAY_ANCHOR.top_right}`}
            style={position === "gutter" ? { bottom: ABOVE_FOOTER } : undefined}
          >
            <OverlayStack.Provider value={true}>
              {ids.map((id) => (
                <div key={id} data-floating={id} className="contents">
                  <NodeView id={id} spec={spec} hotkeys={hotkeys} fire={fire} onInvalid={onInvalid} depth={0} />
                </div>
              ))}
            </OverlayStack.Provider>
          </div>
        ))}
    </>
  );
}

type NodeProps = Props & { id: string; hotkeys: Map<string, ResolvedAction>; depth: number };

function NodeView({ id, spec, hotkeys, fire, onInvalid, depth }: NodeProps): ReactNode {
  const node = spec.nodes[id];
  const Impl = node ? registry[node.type] : undefined;
  const resolved = node && Impl && depth <= 8 ? resolveNode(node, spec.data) : null;
  const invalid = resolved?.status === "invalid" ? resolved.message : null;
  // Reported after the commit, once per message: a store update during
  // render warned in dev and appended the same error on every re-render.
  useEffect(() => {
    if (invalid !== null) onInvalid?.(id, invalid);
  }, [id, invalid, onInvalid]);
  if (!node || !Impl || !resolved || resolved.status !== "ready") return null;
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
  // Rendered as a component (not called as a function) and keyed by node
  // id so hooks inside implementations are stable and unmount cleanup runs
  // when a node is replaced: a Map's WebGL context is released rather than
  // leaked (review 2026-10-29).
  return (
    <div data-node={id} data-type={node.type} className="contents">
      <Impl key={id} id={id} node={node} props={resolved.props} slot={slot} actions={actions} fire={(actionId) => fire(actionId, id)} />
    </div>
  );
}
