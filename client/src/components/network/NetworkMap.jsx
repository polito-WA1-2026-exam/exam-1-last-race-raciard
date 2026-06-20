import { useMemo } from 'react';
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch';
import { PHASES } from '../../hooks/useGame';
import RoutePath from './RoutePath';
import StationMarker from './StationMarker';
import CharacterSprite from './CharacterSprite';
import { LINE_PALETTE, getLineColor } from '../../utils/linePalette';
import { useGameContext } from '../../contexts/GameContext';
import { useWalkAnimation } from '../../hooks/useWalkAnimation';
import { useMapLayout } from '../../hooks/useMapLayout';
import {
  getCurrentSegment,
  getCharacterState,
  getCurrentStationId,
  getHighlightStations
} from '../../utils/gameDerivations';
import './NetworkMap.css';

function ZoomControls() {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  return (
    <div className="zoom-controls">
      <button className="zoom-btn" onClick={() => zoomIn()} title="Zoom in">+</button>
      <button className="zoom-btn" onClick={() => resetTransform()} title="Reset">⌂</button>
      <button className="zoom-btn" onClick={() => zoomOut()} title="Zoom out">-</button>
    </div>
  );
}



/**
 * The core mapping component that visualizes the subway network, handles interactive route planning,
 * and animates the character sprite during execution.
 * 
 * @param {object} props
 * @param {Array<string>} props.selectedRoute - The current planned route of station IDs.
 * @param {function} props.setSelectedRoute - Callback to update the planned route.
 * @param {number} props.execStep - The current step index during execution animation.
 * @param {function} props.setExecStep - Callback to update the execution step index.
 * @param {string} [props.selectedCharacter='Player'] - The identifier for the chosen avatar sprite.
 * @param {Array<object>} [props.stations=[]] - The full list of station definitions.
 * @param {Array<object>} [props.lines=[]] - The full list of line definitions.
 */
function NetworkMap({
  selectedRoute,
  setSelectedRoute,
  execStep,
  setExecStep,
  selectedCharacter = "Player",
  stations = [],
  lines = []
}) {

  const { phase, gameResult, currentGame, gameActions } = useGameContext();
  const { finishGame } = gameActions;
  const showLines = phase === PHASES.SETUP;
  const walkProgress = useWalkAnimation(phase, gameResult, finishGame, setExecStep);

  const {
    stationCoords,
    viewBox,
    stationLineCounts
  } = useMapLayout(stations, lines);

  const steps = gameResult?.steps || [];
  const isFinished = execStep >= steps.length;
  const currentStep = steps[execStep];
  const lastStep = steps[steps.length - 1];
  const hasFailedStep = steps.some(s => s.isFailed) || gameResult?.isInvalid;

  const currentSegment = useMemo(() => getCurrentSegment(phase, currentStep), [phase, currentStep]);
  const characterState = useMemo(() => getCharacterState(phase, gameResult, execStep), [phase, gameResult, execStep]);
  const currentStationId = useMemo(() => getCurrentStationId(phase, currentGame, execStep, gameResult, selectedRoute), [phase, currentGame, execStep, gameResult, selectedRoute]);
  const highlightStations = useMemo(() => getHighlightStations(phase, currentGame), [phase, currentGame]);

  const showFailOverlay = gameResult?.isInvalid && (
    phase === PHASES.RESULT ||
    (phase === PHASES.EXECUTION && (currentStep?.isFailed || (isFinished && lastStep?.isFailed)))
  );

  const showSuccessOverlay = !gameResult?.isInvalid && steps.length > 0 && (
    phase === PHASES.RESULT ||
    (phase === PHASES.EXECUTION && isFinished && !hasFailedStep)
  );

  // Handle station clicking internally
  const handleStationClick = (targetId) => {
    if (phase !== PHASES.PLANNING) return;

    const currentId = selectedRoute.length === 0
      ? currentGame?.start.id
      : selectedRoute[selectedRoute.length - 1];

    if (targetId === currentId) return;

    // Clicking the previous station acts as undo
    if (selectedRoute.length > 1 && targetId === selectedRoute[selectedRoute.length - 2]) {
      setSelectedRoute(selectedRoute.slice(0, -1));
      return;
    }

    // Prevent duplicate links
    let linkExists = false;
    for (let i = 0; i < selectedRoute.length - 1; i++) {
      const s1 = selectedRoute[i];
      const s2 = selectedRoute[i + 1];
      if ((s1 === currentId && s2 === targetId) || (s1 === targetId && s2 === currentId)) {
        linkExists = true;
        break;
      }
    }
    if (linkExists) return;

    setSelectedRoute([...selectedRoute, targetId]);
  };

  const currentStation = phase === PHASES.SETUP ? null : stations.find(s => s.id === currentStationId);

  // Animation coordinates logic
  let startCoords = currentStation ? (stationCoords[currentStation.id] || null) : null;
  let endCoords = null;

  if (currentSegment) {
    const s1 = stations.find(s => s.id === currentSegment.s1_id);
    const s2 = stations.find(s => s.id === currentSegment.s2_id);
    if (s1 && s2) {
      startCoords = stationCoords[s1.id];
      endCoords = stationCoords[s2.id];
    }
  }

  return (
    <div className="canvas-container">
      {showFailOverlay && gameResult?.failReason && (
        <div className="fail-overlay">
          <span className="fail-overlay-label">MISSION FAILED</span>
          <span className="fail-overlay-reason">{gameResult.failReason}</span>
        </div>
      )}
      {showSuccessOverlay && (
        <div className="success-overlay animate-pulse">
          <span className="success-overlay-label">RACE COMPLETED</span>
          <span className="success-overlay-score">Score: {gameResult?.score || 0} Coins</span>
        </div>
      )}
      <TransformWrapper
        initialScale={1}
        minScale={0.4}
        maxScale={4}
        wheel={{ step: 0.001 }}
        pinch={{ step: 5 }}
        doubleClick={{ disabled: false, step: 0.7 }}
        centerOnInit
      >
        <ZoomControls />
        <TransformComponent
          wrapperStyle={{ width: '100%', height: '100%' }}
          contentStyle={{ width: '100%', height: '100%' }}
        >
          <div className="canvas-content-wrapper">
            <svg
              viewBox={viewBox}
              className="map-canvas-svg"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" opacity="0.05" />
                </pattern>
              </defs>

              {/* Background grid */}
              {/* <rect x={vbX} y={vbY} width={vbWidth} height={vbHeight} fill="url(#smallGrid)" /> */}
              <rect x="-1000" y="-1000" width="3000" height="3000" fill="url(#smallGrid)" />

              {/* Planned Route (grey dashed preview during planning) */}
              {phase === PHASES.PLANNING && (
                <RoutePath
                  variant="planning"
                  stationCoords={stationCoords}
                  segments={selectedRoute.slice(1).map((stationId, i) => ({
                    s1_id: selectedRoute[i],
                    s2_id: stationId
                  }))}
                />
              )}

              {/* Traversed Journey Trail */}
              <RoutePath
                variant="journey"
                stationCoords={stationCoords}
                segments={gameResult?.steps?.filter(s => !s.isFailed).map(s => ({
                  s1_id: s.from,
                  s2_id: s.to
                })) ?? []}
                colors={gameResult?.steps?.filter(s => !s.isFailed).map(s => getLineColor(s.lineId, lines)) ?? []}
                execStep={execStep}
                walkProgress={walkProgress}
              />

              {/* Network lines */}
              {lines.map((line, idx) => (
                <RoutePath
                  key={line.id}
                  variant="network"
                  stationCoords={stationCoords}
                  waypoints={[...line.stations].sort((a, b) => a.position - b.position).map(s => s.id)}
                  color={LINE_PALETTE[idx % LINE_PALETTE.length]}
                  visible={showLines}
                />
              ))}

              {/* Draw Stations */}
              {stations.map(station => (
                <StationMarker
                  key={station.id}
                  station={station}
                  coords={stationCoords[station.id] || { x: 0, y: 0 }}
                  isTarget={highlightStations.includes(station.id)}
                  isCurrent={station.id === currentStationId}
                  canClick={phase === PHASES.PLANNING}
                  onClick={handleStationClick}
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
                  character={selectedCharacter}
                />
              )}
            </svg>
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}

export default NetworkMap;
