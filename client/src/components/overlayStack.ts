import { createContext } from "react";

/**
 * Where an overlay anchor sits. The top anchors clear the top bar (header,
 * offline banner, mic indicator); the bottom anchors clear the footer.
 */
export const OVERLAY_ANCHOR: Record<string, string> = {
  top_left: "top-14 left-6",
  top_right: "top-14 right-6",
  bottom_left: "bottom-28 left-6",
  bottom_right: "bottom-28 right-6",
  center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
};

/**
 * True inside a renderer column that already anchors its overlays, so each
 * Overlay lays out in flow instead of positioning itself (review
 * 2026-10-30, item 8: overlays at one corner used to pile up).
 */
export const OverlayStack = createContext(false);
