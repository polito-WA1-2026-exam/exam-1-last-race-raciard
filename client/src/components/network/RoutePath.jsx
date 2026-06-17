import React from 'react';

/**
 * Unified path-drawing component for all three route types.
 *
 * variant="network"
 *   Draws a continuous polyline through ordered station IDs (`waypoints`).
 *   Thick solid stroke + subtle white dashed overlay.  Toggled by `visible`.
 *
 * variant="planning"
 *   Draws each segment in `segments` as an individual dashed gray line.
 *   Used during the planning phase to preview the user's route.
 *
 * variant="journey"
 *   Draws completed and in-progress segments from `segments`.
 *   Each segment can have its own colour via `colors[i]`.
 *   The segment at `execStep` is partially drawn up to `walkProgress`.
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
