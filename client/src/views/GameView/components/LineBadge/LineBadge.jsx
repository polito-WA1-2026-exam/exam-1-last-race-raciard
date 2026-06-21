import { getLineColor } from '../../../../utils/linePalette';
import './LineBadge.css';

/**
 * A small coloured pill showing the line's initial letter.
 * Used anywhere a line needs a visual identity marker.
 *
 * @param {object} props
 * @param {object} props.line - The line object containing an id and name.
 * @param {Array} props.lines - The full array of lines used to determine the correct color.
 * @param {'sm'|'md'} [props.size='sm'] - The size modifier for the badge styling.
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
