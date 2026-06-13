import React from 'react';
import LinePath from './LinePath';
import StationMarker from './StationMarker';
import CharacterSprite from './CharacterSprite';
import JourneyPath from './JourneyPath';
import PlanningPath from './PlanningPath';

function MapCanvas({ stations, lines, highlightStations, currentStationId, onStationClick, showLines, characterState = 'idle', walkProgress = 0, currentSegment = null, palette = [], gameResult = null, execStep = 0, phase, selectedRoute = [], character = 'Player' }) {
  const baseWidth = 1200;
  const baseHeight = 500;
  const gridPadding = 40;

  // 1. Calculate dynamic grid coordinates for stations (logical grid)
  const cols = Math.ceil(Math.sqrt(stations.length)) + 1;
  const rows = Math.ceil(stations.length / (cols - 1)) + 1;
  const xStep = (baseWidth - 2 * gridPadding) / (cols - 1);
  const yStep = (baseHeight - 2 * gridPadding) / (rows - 1);

  const dynamicStationCoords = {};
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  stations.forEach((s, idx) => {
    const col = idx % (cols - 1);
    const row = Math.floor(idx / (cols - 1));
    const x = gridPadding + col * xStep + (row % 2 === 0 ? 0 : xStep / 2);
    const y = gridPadding + row * yStep;

    dynamicStationCoords[s.id] = { x, y };

    // Track bounds for viewBox optimization
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  });

  // 2. Optimize ViewBox: "Shrink-wrap" around the stations with safe margins
  const margin = 70; // Safe space for labels and character
  const vbX = minX - margin;
  const vbY = minY - margin - 30; // Extra top room for character
  const vbWidth = (maxX - minX) + 2 * margin;
  const vbHeight = (maxY - minY) + 2 * margin + 30;

  // Calculate interchanges
  const stationLineCounts = {};
  lines.forEach(line => {
    line.stations.forEach(s => {
      stationLineCounts[s.id] = (stationLineCounts[s.id] || 0) + 1;
    });
  });

  const currentStation = stations.find(s => s.id === currentStationId);

  // Animation coordinates logic
  let startCoords = currentStation ? (dynamicStationCoords[currentStation.id] || null) : null;
  let endCoords = null;

  if (phase === 'RESULT' && gameResult?.isInvalid) {
    const failedStep = gameResult.steps[execStep];
    if (failedStep?.isFailed) {
      startCoords = dynamicStationCoords[failedStep.segment.s1_id];
      endCoords = null;
    }
  } else if (currentSegment) {
    const s1 = stations.find(s => s.id === currentSegment.s1_id);
    const s2 = stations.find(s => s.id === currentSegment.s2_id);
    if (s1 && s2) {
      startCoords = dynamicStationCoords[s1.id];
      endCoords = dynamicStationCoords[s2.id];
    }
  }
  return (
    <svg
      viewBox={`${vbX} ${vbY} ${vbWidth} ${vbHeight}`}
      className="w-full h-full drop-shadow-2xl"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" opacity="0.05" />
        </pattern>
      </defs>

      {/* Background grid */}
      <rect x={vbX} y={vbY} width={vbWidth} height={vbHeight} fill="url(#smallGrid)" />

      {/* Planned Route (Grey lines during planning) */}
      {phase === 'PLANNING' && (
        <PlanningPath 
          selectedRoute={selectedRoute} 
          dynamicStationCoords={dynamicStationCoords} 
        />
      )}

      {/* Traversed Journey Trail (Leaves behind the line) */}
      <JourneyPath
        steps={gameResult?.steps}
        execStep={execStep}
        walkProgress={walkProgress}
        dynamicStationCoords={dynamicStationCoords}
        palette={palette}
      />

      {/* Draw Lines */}
      {lines.map((line, idx) => (
        <LinePath
          key={line.id}
          line={line}
          stationCoords={dynamicStationCoords}
          showLines={showLines}
          color={palette[idx % palette.length]}
        />
      ))}

      {/* Draw Stations */}
      {stations.map(station => (
        <StationMarker
          key={station.id}
          station={station}
          coords={dynamicStationCoords[station.id] || { x: 0, y: 0 }}
          isTarget={highlightStations.includes(station.id)}
          isCurrent={station.id === currentStationId}
          canClick={!!onStationClick}
          onClick={onStationClick}
          isInterchange={stationLineCounts[station.id] > 1}
        />
      ))}

      {/* Draw Character with Animation */}
      {startCoords && (
        <CharacterSprite 
          x={startCoords.x} 
          y={startCoords.y} 
          x2={endCoords?.x}
          y2={endCoords?.y}
          progress={walkProgress}
          state={characterState}
          mapHeight={vbHeight}
          character={character}
        />
      )}

    </svg>
  );
}

export default MapCanvas;
