import React from 'react';
import { getLineColor } from '../../utils/linePalette';
import './LineBadge.css';

/**
 * A small coloured pill showing the line's initial letter.
 * Used anywhere a line needs a visual identity marker.
 *
 * @param {{ line: {id,name}, lines: Array, size?: 'sm'|'md' }} props
 */
function LineBadge({ line, lines, size = 'sm' }) {
  const color = getLineColor(line.id, lines);
  return (
    <span
      className={`line-badge line-badge--${size}`}
      style={{ backgroundColor: color }}
      title={line.name}
    >
      {line.name.charAt(0)}
    </span>
  );
}

export default LineBadge;
