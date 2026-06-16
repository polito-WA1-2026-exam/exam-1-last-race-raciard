import React, { useRef, useState, useEffect } from 'react';
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch';
import MapCanvas from './network/MapCanvas';
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

const LINE_PALETTE = ['#EE352E', '#0039A6', '#00933C', '#FCCC0A', '#B933AD', '#00ADD0', '#FF6319', '#6CBE45'];

function NetworkMap({
  stations,
  lines,
  highlightStations,
  onStationClick,
  currentStationId,
  showLines = true,
  characterState = 'idle',
  walkProgress = 0,
  currentSegment = null,
  gameResult = null,
  execStep = 0,
  phase,
  selectedRoute = [],
  character = 'Player',
  PHASES,
  currentGame,
  timeLeft,
  onStart,
  onSubmit,
  onRestart
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTitle = () => {
    switch (phase) {
      case PHASES?.SETUP: return 'Game Setup';
      case PHASES?.PLANNING: return 'Route Planning';
      case PHASES?.EXECUTION: return 'Journey Execution';
      case PHASES?.RESULT: return 'Final Results';
      default: return 'System Map';
    }
  };

  const getSubTitle = () => {
    if (phase === PHASES?.PLANNING && currentGame) {
      return `Target: ${currentGame.start.name} to ${currentGame.destination.name}`;
    }
    return '';
  };

  // Prevent body scroll when map is in theater mode
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isExpanded]);

  return (
    <div className={`network-map-outer ${isExpanded ? 'expanded' : 'standard'}`}>

      {/* Station Wall Aesthetic (Subway Tiles) - Dark Version */}
      <div className={`map-background ${isExpanded ? 'dimmed' : ''}`}
        style={{
          backgroundImage: 'linear-gradient(90deg, transparent 95%, rgba(255,255,255,0.02) 5%), linear-gradient(0deg, transparent 95%, rgba(255,255,255,0.02) 5%)',
          backgroundSize: '40px 20px'
        }}>
      </div>

      {/* Industrial Frame Wrapper */}
      <div className={`industrial-frame ${isExpanded ? 'expanded' : 'standard'}`}>


        {/* Signage Header */}
        <header className="map-header">
          <div className="header-left">
            <div className="header-titles">
              <h3>{getTitle()}</h3>
              <p className="header-subtitle">{getSubTitle()}</p>
            </div>
          </div>
          <div className="header-right">
            {phase === PHASES?.SETUP && (
              <button onClick={onStart} className="expand-button action-btn-blue">START RACE</button>
            )}

            {phase === PHASES?.PLANNING && (
              <>
                <div className={`timer-compact ${timeLeft < 20 ? 'timer-urgent' : 'timer-normal'}`}>
                  {String(timeLeft).padStart(2, '0')}s
                </div>
                <button onClick={onSubmit} className="expand-button action-btn-green">FINISH PLAN</button>
              </>
            )}

            {phase === PHASES?.RESULT && (
              <button onClick={onRestart} className="expand-button action-btn-blue">NEW GAME</button>
            )}

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="expand-button"
            >
              {isExpanded ? '⏹ Minimize' : '⛶ Maximize'}
            </button>
          </div>
        </header>

        {/* Dynamic SVG Map Container - Pannable & Zoomable */}
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
                  palette={LINE_PALETTE}
                  gameResult={gameResult}
                  execStep={execStep}
                  phase={phase}
                  selectedRoute={selectedRoute}
                  character={character}
                />
              </div>
            </TransformComponent>
          </TransformWrapper>
        </div>

        {/* Footer - Detailed Station Info */}
        <footer className="map-footer">
          <div className="footer-left">
            <div className="footer-section">
              <p className="footer-label">Accessibility</p>
              <div className="accessibility-icons">♿ 🛗 🚾</div>
            </div>
            <div className="footer-section footer-section-large">
              <p className="footer-label">Transfer Points</p>
              <div className="transfer-points">
                {lines.map((l, idx) => (
                  <div key={l.id} className="flex items-center group">
                    <span className="line-indicator"
                      style={{ backgroundColor: LINE_PALETTE[idx % LINE_PALETTE.length] }}>
                      {l.name.charAt(0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="footer-right">
            <div className="footer-id">
              REF_ID: 0x48FA_SUB_NW_2026
            </div>
            <div className="footer-engine">
              Printed via Terminal Engine v4.2
            </div>
          </div>
        </footer>
      </div>

      {/* Glass/Dust Effect Layer */}
      <div className="glass-layer"></div>
    </div>
  );
}

export default NetworkMap;
