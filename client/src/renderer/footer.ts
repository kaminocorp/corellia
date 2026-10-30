/**
 * The footer's measured extent from the bottom edge (the error line, the
 * transcript, the input and the footer's own offset), set on the display
 * root by App as a CSS variable. The panel and full zones, and the gutter
 * column of floating cards, end above it, so a map, table or chart never
 * shares pixels with the transcript whatever the viewport (review
 * 2026-10-30 round 3, item 3: the fixed `bottom-36` left 111-180 px of
 * overlap). The fallback is the old fixed footer for a page that has not
 * measured yet.
 */
export const FOOTER_HEIGHT_VAR = "--footer-h";
export const ABOVE_FOOTER = `calc(var(${FOOTER_HEIGHT_VAR}, 9rem) + 0.5rem)`;
