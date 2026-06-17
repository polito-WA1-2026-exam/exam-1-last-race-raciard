/**
 * Shared line colour palette (MTA-inspired).
 * Colours are assigned by the position of a line in the lines array returned
 * by the API, which is ordered by line ID — so the mapping is stable.
 */
export const LINE_PALETTE = [
  '#EE352E', // Red
  '#0039A6', // Blue
  '#00933C', // Green
  '#FCCC0A', // Yellow
  '#B933AD', // Purple
  '#00ADD0', // Cyan
  '#FF6319', // Orange
  '#6CBE45', // Lime
];

/**
 * Return the colour assigned to a line, looked up by line ID.
 * Falls back to a neutral grey for unknown IDs.
 *
 * @param {number} lineId
 * @param {Array<{id: number}>} lines  – the full lines array (ordered by id)
 * @returns {string} CSS colour string
 */
export function getLineColor(lineId, lines) {
  const idx = lines.findIndex(l => l.id === lineId);
  return idx >= 0 ? LINE_PALETTE[idx % LINE_PALETTE.length] : '#64748b';
}
