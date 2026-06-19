import { useState, useEffect } from 'react';
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch';
import { PHASES } from '../../hooks/useGame';
import RoutePath from './RoutePath';
import StationMarker from './StationMarker';
import CharacterSprite from './CharacterSprite';
import LineBadge from './LineBadge';
import { computeSubwayLayout } from '../../utils/layoutAlgorithm';
import { LINE_PALETTE, getLineColor } from '../../utils/linePalette';
import './NetworkMap.css';

function ZoomControls() {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  return (
    <div className="zoom-controls">
      <button className="zoom-btn" onClick={() => zoomIn()} title="Zoom in">＋</button>
      <button className="zoom-btn" onClick={() => resetTransform()} title="Reset">⌂</button>
      <button className="zoom-btn" onClick={() => zoomOut()} title="Zoom out">－</button>
    </div>
  );
}

function NetworkMap({
  phase,
  currentGame,
  gameResult,
  selectedRoute,
  timeLeft,
  selectedCharacter,
  stations = [],
  lines = [],
  startGame,
  submitRoute,
  resetToSetup,
  setSelectedRoute,
  setExecStep,
  finishGame
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [execStep, setLocalExecStep] = useState(0);
  const [walkProgress, setWalkProgress] = useState(0);

  const showLines = phase === PHASES.SETUP;

  // Drive visual segment walk animation locally using requestAnimationFrame loop
  useEffect(() => {
    if (phase !== 'EXECUTION' || !gameResult) {
      return;
    }

    if (!gameResult.steps || gameResult.steps.length === 0) {
      finishGame?.();
      return;
    }

    let currentStep = 0;
    let startTimestamp = null;
    const walkDuration = 1000; // 1 second walk duration
    const pauseDuration = 200; // 0.2 second pause at stations
    const segmentDuration = walkDuration + pauseDuration;
    let animId;

    const animate = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;

      // Determine which step index we are on
      const stepIndex = Math.floor(elapsed / segmentDuration);

      if (stepIndex < gameResult.steps.length) {
        if (stepIndex !== currentStep) {
          currentStep = stepIndex;
          setLocalExecStep(stepIndex);
          setExecStep?.(stepIndex);
        }

        const stepElapsed = elapsed % segmentDuration;
        const progress = Math.min(stepElapsed / walkDuration, 1);
        setWalkProgress(progress);

        animId = requestAnimationFrame(animate);
      } else {
        // We have completed all steps!
        setLocalExecStep(gameResult.steps.length);
        setExecStep?.(gameResult.steps.length);
        setWalkProgress(0);

        // Pause briefly at the final station, then finish the execution phase
        const delay = setTimeout(() => {
          finishGame?.();
        }, 1000);

        return () => clearTimeout(delay);
      }
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [phase, gameResult, setExecStep, finishGame]);

  const getTitle = () => {
    switch (phase) {
      case PHASES.SETUP: return 'Game Setup';
      case PHASES.PLANNING: return 'Route Planning';
      case PHASES.EXECUTION: return 'Journey Execution';
      case PHASES.RESULT: return 'Final Results';
      default: return 'System Map';
    }
  };

  const getSubTitle = () => {
    if (phase === PHASES.PLANNING && currentGame) {
      return `Target: ${currentGame.start.name} to ${currentGame.destination.name}`;
    }
    return '';
  };

  // Derive active segment coordinates
  let currentSegment = null;
  if (phase === 'EXECUTION' && gameResult?.steps[execStep]) {
    if (!gameResult.steps[execStep].isFailed) {
      currentSegment = { s1_id: gameResult.steps[execStep].from, s2_id: gameResult.steps[execStep].to };
    }
  }

  // Derive character state
  let characterState = 'idle';
  if (phase === 'EXECUTION') {
    const currentStep = gameResult?.steps[execStep];
    if (currentStep?.isFailed) {
      characterState = 'lose';
    } else if (execStep >= gameResult?.steps?.length) {
      const lastStep = gameResult?.steps[gameResult.steps.length - 1];
      characterState = lastStep?.isFailed ? 'lose' : 'walk';
    } else {
      characterState = 'walk';
    }
  } else if (phase === 'RESULT') {
    const hasFailedStep = gameResult?.steps?.some(s => s.isFailed);
    if (hasFailedStep || gameResult?.isInvalid) {
      characterState = 'lose';
    } else {
      characterState = gameResult?.score > 0 ? 'win' : 'lose';
    }
  }

  // Derive current station ID dynamically from source of truth
  let currentStationId = null;
  if (phase === PHASES.PLANNING) {
    currentStationId = selectedRoute[selectedRoute.length - 1] || currentGame?.start.id;
  } else if ((phase === PHASES.EXECUTION || phase === PHASES.RESULT) && gameResult?.steps?.length) {
    const isFinished = phase === PHASES.RESULT || execStep >= gameResult.steps.length;
    const lastStep = gameResult.steps[gameResult.steps.length - 1];
    currentStationId = isFinished
      ? (lastStep.isFailed ? lastStep.from : lastStep.to)
      : gameResult.steps[execStep]?.from;
  } else if (currentGame) {
    currentStationId = currentGame.start.id;
  }

  // Derive highlight stations
  const highlightStations = (phase === PHASES.PLANNING || phase === PHASES.EXECUTION || phase === PHASES.RESULT) && currentGame
    ? [currentGame.start.id, currentGame.destination.id]
    : [];

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
      const s2 = selectedRoute[i+1];
      if ((s1 === currentId && s2 === targetId) || (s1 === targetId && s2 === currentId)) {
        linkExists = true;
        break;
      }
    }
    if (linkExists) return;

    setSelectedRoute([...selectedRoute, targetId]);
  };

  const baseWidth = 1000;
  const baseHeight = 1000;

  // Compute topology-aware station coordinates
  const dynamicStationCoords = computeSubwayLayout(stations, lines, baseWidth, baseHeight);

  // ViewBox: fit the computed bounding box with a margin
  const margin = 80;
  const allCoords = Object.values(dynamicStationCoords);
  const minX = allCoords.length ? Math.min(...allCoords.map(c => c.x)) : 0;
  const maxX = allCoords.length ? Math.max(...allCoords.map(c => c.x)) : baseWidth;
  const minY = allCoords.length ? Math.min(...allCoords.map(c => c.y)) : 0;
  const maxY = allCoords.length ? Math.max(...allCoords.map(c => c.y)) : baseHeight;
  const vbX = minX - margin;
  const vbY = minY - margin;
  const vbWidth = (maxX - minX) + margin * 2;
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

  if (currentSegment) {
    const s1 = stations.find(s => s.id === currentSegment.s1_id);
    const s2 = stations.find(s => s.id === currentSegment.s2_id);
    if (s1 && s2) {
      startCoords = dynamicStationCoords[s1.id];
      endCoords = dynamicStationCoords[s2.id];
    }
  }

  const showFailOverlay = gameResult?.isInvalid && (
    phase === PHASES.RESULT ||
    (phase === PHASES.EXECUTION && (
      gameResult.steps[execStep]?.isFailed ||
      (execStep >= gameResult.steps.length && gameResult.steps[gameResult.steps.length - 1]?.isFailed)
    ))
  );

  return (
    <div className={`network-map-outer ${isExpanded ? 'expanded' : 'standard'}`}>
      <div className={`map-background ${isExpanded ? 'dimmed' : ''}`}
        style={{
          backgroundImage: 'linear-gradient(90deg, transparent 95%, rgba(255,255,255,0.02) 5%), linear-gradient(0deg, transparent 95%, rgba(255,255,255,0.02) 5%)',
          backgroundSize: '40px 20px'
        }}>
      </div>

      <div className={`industrial-frame ${isExpanded ? 'expanded' : 'standard'}`}>
        <header className="map-header">
          <div className="header-left">
            <div className="header-titles">
              <h3>{getTitle()}</h3>
              <p className="header-subtitle">{getSubTitle()}</p>
            </div>
          </div>
          <div className="header-right">
            {phase === PHASES.SETUP && (
              <button onClick={startGame} className="expand-button action-btn-blue">START RACE</button>
            )}

            {phase === PHASES.PLANNING && (
              <>
                <div className={`timer-compact ${timeLeft < 20 ? 'timer-urgent' : 'timer-normal'}`}>
                  {String(timeLeft).padStart(2, '0')}s
                </div>
                <button onClick={submitRoute} className="expand-button action-btn-green">FINISH PLAN</button>
              </>
            )}

            {phase === PHASES.RESULT && (
              <button onClick={resetToSetup} className="expand-button action-btn-blue">NEW GAME</button>
            )}

            <button onClick={() => setIsExpanded(!isExpanded)} className="expand-button">
              {isExpanded ? '⏹ Minimize' : '⛶ Maximize'}
            </button>
          </div>
        </header>

        <div className="canvas-container">
          {showFailOverlay && gameResult?.failReason && (
            <div className="fail-overlay">
              <span className="fail-overlay-label">MISSION FAILED</span>
              <span className="fail-overlay-reason">{gameResult.failReason}</span>
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

                  {/* Planned Route (grey dashed preview during planning) */}
                  {phase === PHASES.PLANNING && (
                    <RoutePath
                      variant="planning"
                      stationCoords={dynamicStationCoords}
                      segments={selectedRoute.slice(1).map((stationId, i) => ({
                        s1_id: selectedRoute[i],
                        s2_id: stationId
                      }))}
                    />
                  )}

                  {/* Traversed Journey Trail */}
                  <RoutePath
                    variant="journey"
                    stationCoords={dynamicStationCoords}
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
                      stationCoords={dynamicStationCoords}
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
                      coords={dynamicStationCoords[station.id] || { x: 0, y: 0 }}
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

        <footer className="map-footer">
          <div className="footer-left">
            <div className="footer-section">
              <p className="footer-label">Accessibility</p>
              <div className="accessibility-icons">♿ 🛗 🚾</div>
            </div>
            <div className="footer-section footer-section-large">
              <p className="footer-label">Transfer Points</p>
              <div className="transfer-points">
                {lines.map((l) => (
                  <LineBadge key={l.id} line={l} lines={lines} size="md" />
                ))}
              </div>
            </div>
          </div>

          <div className="footer-right">
            <div className="footer-id">REF_ID: 0x48FA_SUB_NW_2026</div>
            <div className="footer-engine">Printed via Terminal Engine v4.2</div>
          </div>
        </footer>
      </div>

      <div className="glass-layer"></div>
    </div>
  );
}

export default NetworkMap;
