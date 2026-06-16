import React from 'react';
import './MapCanvas.css';

function PlanningPath({ selectedRoute, dynamicStationCoords }) {
  if (!selectedRoute || selectedRoute.length === 0) return null;

  return (
    <g className="planning-trail">
      {selectedRoute.map((seg, i) => {
        const s1 = dynamicStationCoords[seg.s1_id];
        const s2 = dynamicStationCoords[seg.s2_id];
        
        if (!s1 || !s2) return null;

        return (
          <line
            key={i}
            x1={s1.x}
            y1={s1.y}
            x2={s2.x}
            y2={s2.y}
            stroke="#64748b" // slate-500
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray="15 8"
            opacity="0.5"
            className="planning-trail"
          />
        );
      })}
    </g>
  );
}

export default PlanningPath;
