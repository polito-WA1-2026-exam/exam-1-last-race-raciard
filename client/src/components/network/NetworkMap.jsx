import React, { useState } from 'react';
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch';
import { useGameContext } from '../../contexts/GameContext';
import MapCanvas from './MapCanvas';
import LineBadge from './LineBadge';
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

function NetworkMap() {
  const {
    PHASES, phase, currentGame, timeLeft,
    stations, lines,
    highlightStations, onStationClick: _onStationClick,
    currentStationId, characterState, walkProgress,
    currentSegment, gameResult, execStep, selectedRoute,
    selectedCharacter,
    startGame, submitRoute, handleStationClick, setPhase,
  } = useGameContext();

  const [isExpanded, setIsExpanded] = useState(false);

  const onStationClick = phase === PHASES.PLANNING ? handleStationClick : null;
  const showLines = phase === PHASES.SETUP;

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
              <button onClick={() => setPhase(PHASES.SETUP)} className="expand-button action-btn-blue">NEW GAME</button>
            )}

            <button onClick={() => setIsExpanded(!isExpanded)} className="expand-button">
              {isExpanded ? '⏹ Minimize' : '⛶ Maximize'}
            </button>
          </div>
        </header>

        <div className="canvas-container">
          {phase === PHASES.RESULT && gameResult?.isInvalid && gameResult?.failReason && (
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
                <MapCanvas
                  stations={stations}
                  lines={lines}
                  highlightStations={highlightStations}
                  onStationClick={onStationClick}
                  currentStationId={currentStationId}
                  showLines={showLines}
                  characterState={characterState}
                  walkProgress={walkProgress}
                  currentSegment={currentSegment}
                  gameResult={gameResult}
                  execStep={execStep}
                  phase={phase}
                  selectedRoute={selectedRoute}
                  character={selectedCharacter}
                />
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
