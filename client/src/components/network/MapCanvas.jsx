import React from 'react';
import LinePath from './LinePath';
import StationMarker from './StationMarker';
import CharacterSprite from './CharacterSprite';
import JourneyPath from './JourneyPath';
import PlanningPath from './PlanningPath';
import { computeSubwayLayout } from './layoutAlgorithm';
import './MapCanvas.css';

function MapCanvas({ stations, lines, highlightStations, currentStationId, onStationClick, showLines, characterState = 'idle', walkProgress = 0, currentSegment = null, palette = [], gameResult = null, execStep = 0, phase, selectedRoute = [], character = 'Player' }) {
  const baseWidth = 1000;
  const baseHeight = 1000;

  // 1. Compute topology-aware station coordinates
  const dynamicStationCoords = React.useMemo(
    () => computeSubwayLayout(stations, lines, baseWidth, baseHeight),
    [stations, lines]
  );

  // 2. ViewBox: fit the computed bounding box with a margin
  const margin = 80;
  const allCoords = Object.values(dynamicStationCoords);
  const minX = allCoords.length ? Math.min(...allCoords.map(c => c.x)) : 0;
  const maxX = allCoords.length ? Math.max(...allCoords.map(c => c.x)) : baseWidth;
  const minY = allCoords.length ? Math.min(...allCoords.map(c => c.y)) : 0;
  const maxY = allCoords.length ? Math.max(...allCoords.map(c => c.y)) : baseHeight;
  const vbX = minX - margin;
  const vbY = minY - margin;
  const vbWidth  = (maxX - minX) + margin * 2;
  const vbHeight = (maxY - minY) + margin * 2;

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
      className="map-canvas-svg"
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
