import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNetwork } from '../hooks/useNetwork';
import { useGame, PHASES } from '../hooks/useGame';

// Modular Components
import Instructions from '../components/Instructions';
import NetworkMap from '../components/NetworkMap';
import RouteBuilder from '../components/game/RouteBuilder';
import JourneyLog from '../components/game/JourneyLog';
import './GameView.css';

import { CHARACTERS } from '../components/network/CharacterSprite';

function GameView() {
  const { user } = useAuth();

  // Custom hooks for shared logic
  const { stations, lines, segments, loading: networkLoading } = useNetwork();
  const {
    phase,
    currentGame,
    selectedRoute,
    timeLeft,
    gameResult,
    execStep,
    walkProgress,
    startGame,
    submitRoute,
    handleStationClick,
    undoLastStep,
    setPhase,
    selectedCharacter,
    setSelectedCharacter
  } = useGame(segments, stations, lines);

  const getCharacterState = () => {
    // During execution, if the CURRENT step we are about to start is failed, it's 'lose'
    if (phase === PHASES.EXECUTION) {
      if (gameResult?.steps[execStep]?.isFailed) return 'lose';
      return 'walk';
    }
    // In Result phase, if there was ANY failed step (meaning they died), it's 'lose'
    if (phase === PHASES.RESULT) {
      const hasFailedStep = gameResult?.steps?.some(s => s.isFailed);
      if (hasFailedStep || gameResult?.isInvalid) return 'lose';
      if (gameResult?.score > 0) return 'win';
      return 'lose';
    }
    return 'idle';
  };

  // Logic to find current animation segment
  const currentSegment = (phase === PHASES.EXECUTION && gameResult?.steps[execStep])
    ? gameResult.steps[execStep].segment
    : null;

  if (!user) return <Instructions />;
  if (networkLoading) return <div className="loading-initializing">Initializing Network...</div>;

  return (
    <div className="game-view-container">
      <div className="game-layout">
        {/* Main Section: Network View (Massive Estate) */}
        <div className="map-section">
          <NetworkMap
            stations={stations}
            lines={lines}
            showLines={phase === PHASES.SETUP}
            onStationClick={phase === PHASES.PLANNING ? handleStationClick : null}
            characterState={getCharacterState()}
            walkProgress={walkProgress}
            currentSegment={currentSegment}
            gameResult={gameResult}
            execStep={execStep}
            phase={phase}
            selectedRoute={selectedRoute}
            character={selectedCharacter}
            currentStationId={(() => {
              if (phase === PHASES.SETUP) return null;
              if (phase === PHASES.PLANNING) {
                return selectedRoute.length === 0 
                  ? currentGame?.start.id 
                  : selectedRoute[selectedRoute.length - 1].s2_id;
              }
              // If journey is finished but phase is still EXECUTION (the 1s delay)
              if (phase === PHASES.EXECUTION && gameResult?.steps && execStep >= gameResult.steps.length) {
                return gameResult.steps[gameResult.steps.length - 1]?.segment.s2_id;
              }
              // During EXECUTION, base it on the current animated step
              if (gameResult?.steps && gameResult.steps[execStep]) {
                return gameResult.steps[execStep].segment.s1_id;
              }
              // In RESULT phase, stay at the last reached station
              if (phase === PHASES.RESULT && gameResult?.steps && gameResult.steps.length > 0) {
                const lastStep = gameResult.steps[gameResult.steps.length - 1];
                return lastStep.isFailed ? lastStep.segment.s1_id : lastStep.segment.s2_id;
              }
              return currentGame?.start.id;
            })()}
            highlightStations={
              phase === PHASES.PLANNING || phase === PHASES.EXECUTION || phase === PHASES.RESULT
                ? [currentGame?.start.id, currentGame?.destination.id]
                : []
            }
            PHASES={PHASES}
            currentGame={currentGame}
            timeLeft={timeLeft}
            onStart={startGame}
            onSubmit={submitRoute}
            onRestart={() => setPhase(PHASES.SETUP)}
          />
        </div>

        {/* Sidebar Section: Game Controls & Feedback (Fixed Width, Full Height) */}
        <aside className="sidebar-section">
          {phase === PHASES.SETUP && (
            <div className="sidebar-content">
              <h3 className="sidebar-header">Mission Protocol</h3>
              <div className="mission-quote">
                "Identify the optimal sequence through the grid. Terminal access expires in 90 seconds."
              </div>

              {/* Character Selection */}
              <div className="agent-selection">
                <h4 className="agent-selection-title">Select Agent</h4>
                <div className="agent-grid">
                  {Object.keys(CHARACTERS).map(char => (
                    <button
                      key={char}
                      onClick={() => setSelectedCharacter(char)}
                      className={`agent-button ${selectedCharacter === char ? 'selected' : ''}`}
                    >
                      <img src={CHARACTERS[char].idle} alt={char} className="agent-avatar" />
                    </button>
                  ))}
                </div>
                <p className="agent-name">{selectedCharacter}</p>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-icon">📍</span>
                  <div className="stat-info">
                    <span className="stat-label">Nodes</span>
                    <span className="stat-value">{stations.length}</span>
                  </div>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">🚇</span>
                  <div className="stat-info">
                    <span className="stat-label">Lines</span>
                    <span className="stat-value">{lines.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {phase === PHASES.PLANNING && (
            <div className="planning-sidebar">
              <div className="planning-header">
                <p className="destination-label">Final Destination</p>
                <p className="destination-name">{currentGame?.destination.name.toUpperCase()}</p>
              </div>
              <div className="planning-content">
                <RouteBuilder
                  selectedRoute={selectedRoute}
                  stations={stations}
                  onUndo={undoLastStep}
                />
              </div>
            </div>
          )}

          {(phase === PHASES.EXECUTION || phase === PHASES.RESULT) && (
            <JourneyLog
              gameResult={gameResult}
              execStep={execStep}
              stations={stations}
              phase={phase}
              PHASES={PHASES}
            />
          )}
        </aside>
      </div>
    </div>
  );
}

export default GameView;
