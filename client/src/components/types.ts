import type { ReactNode } from "react";

import type { ActionRef, Node } from "../contract";

/** An action attached to a node, with its hotkey resolved by the renderer. */
export type ResolvedAction = ActionRef & { slot: string; nodeId: string; hotkey: string };

/** What every catalog component receives. Props are resolved and validated. */
export type RenderedNodeProps = {
  id: string;
  node: Node;
  props: Record<string, unknown>;
  /** Renders the children of a slot (empty fragment when none). */
  slot: (name: string) => ReactNode;
  actions: ResolvedAction[];
  fire: (actionId: string) => void;
};

export type ComponentImpl = (p: RenderedNodeProps) => ReactNode;
