import { useMemo } from 'react';
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch';
import { PHASES } from '../../../../hooks/useGame';
import RoutePath from './RoutePath';
import StationMarker from './StationMarker';
import CharacterSprite from './CharacterSprite';
import { LINE_PALETTE, getLineColor } from '../../../../utils/linePalette';
import { useGameContext } from '../../../../contexts/GameContext';
import { useWalkAnimation } from '../../../../hooks/useWalkAnimation';
import { useMapLayout } from '../../../../hooks/useMapLayout';
import {
  getCurrentSegment,
  getCharacterState,
  getCurrentStationId
} from '../../../../utils/gameDerivations';
import './NetworkMap.css';

function ZoomControls() {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  return (
    <div className="zoom-controls">
      <button className="zoom-btn" onClick={() => zoomIn()} title="Zoom in">+</button>
      <button className="zoom-btn" onClick={() => resetTransform()} title="Reset">=</button>
      <button className="zoom-btn" onClick={() => zoomOut()} title="Zoom out">-</button>
    </div>
  );
}



/**
 * The core mapping component that visualizes the subway network
 * and animates the character sprite during execution.
 * 
 * @param {object} props
 * @param {Array<string>} props.selectedRoute - The current planned route of station IDs.
 * @param {number} props.execStep - The current step index during execution animation.
 * @param {function} props.setExecStep - Callback to update the execution step index.
 * @param {string} [props.selectedCharacter='Player'] - The identifier for the chosen avatar sprite.
 * @param {Array<object>} [props.stations=[]] - The full list of station definitions.
 * @param {Array<object>} [props.lines=[]] - The full list of line definitions.
 */
function NetworkMap({
  selectedRoute,
  execStep,
  setExecStep,
  selectedCharacter = "Franco",
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
  const currentStep = steps[execStep];

  const currentSegment = useMemo(() => getCurrentSegment(phase, currentStep), [phase, currentStep]);
  const characterState = useMemo(() => getCharacterState(phase, gameResult, execStep), [phase, gameResult, execStep]);
  const currentStationId = useMemo(() => getCurrentStationId(phase, currentGame, execStep, gameResult), [phase, currentGame, execStep, gameResult]);

  // Player position coordinate animation logic
  let playerPosition = currentStationId ? stationCoords[currentStationId] || null : null;
  let playerMovesTo = null;

  if (currentSegment) {
    playerPosition = stationCoords[currentSegment.s1_id] || null;
    playerMovesTo = stationCoords[currentSegment.s2_id] || null;
  }

  return (
    <div className="canvas-container">
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
                  segments={selectedRoute.map(seg => ({
                    s1_id: seg[0],
                    s2_id: seg[1]
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
                  isStart={phase !== PHASES.SETUP && station.id === currentGame?.start?.id}
                  isDestination={phase !== PHASES.SETUP && station.id === currentGame?.destination?.id}
                  isCurrent={station.id === currentStationId}
                  isInterchange={phase == PHASES.SETUP ? stationLineCounts[station.id] > 1 : false}
                />
              ))}

              {/* Draw Character with Animation */}
              {playerPosition && (
                <CharacterSprite
                  x={playerPosition.x}
                  y={playerPosition.y}
                  x2={playerMovesTo?.x}
                  y2={playerMovesTo?.y}
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
