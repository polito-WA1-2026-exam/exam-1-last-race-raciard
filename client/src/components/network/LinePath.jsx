import React from 'react';
import './MapCanvas.css';

function LinePath({ line, stationCoords, showLines, color }) {
  const points = line.stations
    .map(s => stationCoords[s.id]) // Using station ID for lookups
    .filter(Boolean);
  
  if (points.length < 2) return null;

  const pathData = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  return (
    <g opacity={showLines ? 1 : 0} className="line-path-group">
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Subtle inner detail for a more 'official' look */}
      <path
        d={pathData}
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1 20"
      />
    </g>
  );
}

export default LinePath;
