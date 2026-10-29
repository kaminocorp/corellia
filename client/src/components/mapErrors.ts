/** MapLibre error events: tile-level failures carry a tile or a source id and are transient. */
export function isTileError(e: { error?: Error; tile?: unknown; sourceId?: string }): boolean {
  if (e.tile !== undefined || e.sourceId !== undefined) return true;
  const msg = e.error?.message ?? "";
  return /tile|Failed to fetch|AJAXError|404|503/i.test(msg);
}
