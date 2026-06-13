import React from 'react';

function JourneyPath({ steps, execStep, walkProgress, dynamicStationCoords, palette }) {
  if (!steps || steps.length === 0) return null;

  return (
    <g className="journey-trail">
      {steps.map((step, i) => {
        // Only draw up to current step
        if (i > execStep) return null;

        const s1 = dynamicStationCoords[step.segment.s1_id];
        const s2 = dynamicStationCoords[step.segment.s2_id];
        
        if (!s1 || !s2 || step.lineId === null) return null;

        const color = palette[(step.lineId - 1) % palette.length]; // lineId is 1-indexed from server
        
        // Progress for this specific segment
        // If it's a completed step, progress is 1. If it's current step, use walkProgress.
        const currentProgress = i < execStep ? 1 : walkProgress;

        // Calculate end point based on progress
        const targetX = s1.x + (s2.x - s1.x) * currentProgress;
        const targetY = s1.y + (s2.y - s1.y) * currentProgress;

        return (
          <line
            key={i}
            x1={s1.x}
            y1={s1.y}
            x2={targetX}
            y2={targetY}
            stroke={color}
            strokeWidth="14"
            strokeLinecap="round"
            opacity="1"
          />
        );
      })}
    </g>
  );
}

export default JourneyPath;
