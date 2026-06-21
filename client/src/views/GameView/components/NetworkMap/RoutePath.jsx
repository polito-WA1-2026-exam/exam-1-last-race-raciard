/**
 * Unified path-drawing component for all three route types (network, planning, journey).
 *
 * @param {object} props
 * @param {object} props.stationCoords - Map of station IDs to their computed SVG {x, y} coordinates.
 * @param {Array<string>} [props.waypoints] - (Network) Ordered list of station IDs to draw a continuous line through.
 * @param {boolean} [props.visible=true] - (Network) Toggles visibility of the line.
 * @param {string} [props.color='#64748b'] - (Network) The stroke color of the line.
 * @param {Array<object>} [props.segments] - (Planning/Journey) List of segment objects {s1_id, s2_id}.
 * @param {Array<string>} [props.colors] - (Journey) Array of colors corresponding to each segment.
 * @param {number} [props.execStep=0] - (Journey) The current step index during the execution phase.
 * @param {number} [props.walkProgress=0] - (Journey) The interpolation progress (0-1) along the current execStep.
 * @param {'network'|'planning'|'journey'} [props.variant='network'] - Discriminator to determine the rendering style.
 */
function RoutePath({
  stationCoords,
  // network variant
  waypoints,
  visible = true,
  color = '#64748b',
  // planning/journey variant
  segments,
  colors,
  // journey variant
  execStep = 0,
  walkProgress = 0,
  // discriminator
  variant = 'network',
}) {
  if (variant === 'network') {
    if (!waypoints || waypoints.length < 2) return null;

    const points = waypoints
      .map(id => stationCoords[id])
      .filter(Boolean);

    if (points.length < 2) return null;

    const d = points.reduce(
      (acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`,
      ''
    );

    return (
      <g opacity={visible ? 1 : 0} className="route-path-network">
        <path d={d} fill="none" stroke={color}
          strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
        {/* Subtle inner detail */}
        <path d={d} fill="none" stroke="rgba(255,255,255,0.2)"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="1 20" />
      </g>
    );
  }

  if (variant === 'planning') {
    if (!segments || segments.length === 0) return null;

    return (
      <g className="route-path-planning">
        {segments.map((seg, i) => {
          const s1 = stationCoords[seg.s1_id];
          const s2 = stationCoords[seg.s2_id];
          if (!s1 || !s2) return null;
          return (
            <line key={i}
              x1={s1.x} y1={s1.y} x2={s2.x} y2={s2.y}
              stroke="#64748b" strokeWidth="10"
              strokeLinecap="round" strokeDasharray="15 8" opacity="0.5"
            />
          );
        })}
      </g>
    );
  }

  if (variant === 'journey') {
    if (!segments || segments.length === 0) return null;

    return (
      <g className="route-path-journey">
        {segments.map((seg, i) => {
          if (i > execStep) return null;

          const s1 = stationCoords[seg.s1_id];
          const s2 = stationCoords[seg.s2_id];
          if (!s1 || !s2) return null;

          const segColor = colors?.[i] ?? color;
          const progress = i < execStep ? 1 : walkProgress;
          const x2 = s1.x + (s2.x - s1.x) * progress;
          const y2 = s1.y + (s2.y - s1.y) * progress;

          return (
            <line key={i}
              x1={s1.x} y1={s1.y} x2={x2} y2={y2}
              stroke={segColor} strokeWidth="14" strokeLinecap="round"
            />
          );
        })}
      </g>
    );
  }

  return null;
}

export default RoutePath;
