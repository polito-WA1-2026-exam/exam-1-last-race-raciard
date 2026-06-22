import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { GameProvider, useGameContext, PHASES } from '../../contexts/GameContext';
import { useNetwork } from '../../hooks/useNetwork';
import Instructions from './components/Instructions/Instructions';
import NetworkMap from './components/NetworkMap/NetworkMap';
import GameControls from './components/GameControls/GameControls';
import RouteBuilder from './components/RouteBuilder/RouteBuilder';
import JourneyLog from './components/JourneyLog/JourneyLog';
import { CHARACTERS } from './components/NetworkMap/CharacterSprite';
import './GameView.css';

function GameLayout() {
  // Grab the current game state and helper actions from our context provider
  const {
    phase,
    currentGame,
    gameResult,
    selectedRoute,
    gameActions,
  } = useGameContext();

  // Load the stations network topology, connecting paths, and loading flags
  const { stations, lines, segments, loading: networkLoading } = useNetwork();
  const { setSelectedRoute } = gameActions;

  // Let the user pick which driver character sprite they want to run on the map
  const [selectedCharacter, setSelectedCharacter] = useState(Object.keys(CHARACTERS)[0]);

  // Track our current animation step during the simulated run
  const [execStep, setExecStep] = useState(0);

  // Controls whether the main route map gets expanded to full-width mode
  const [isExpanded, setIsExpanded] = useState(false);

  // Handles errors like submitting empty routes
  const [validationError, setValidationError] = useState('');

  // Keep track of the active game ID to reset progress when switching levels
  const [prevGameId, setPrevGameId] = useState(null);

  // Automatically hide the validation error banner after 3 seconds
  useEffect(() => {
    if (!validationError) return;
    const timer = setTimeout(() => {
      setValidationError('');
    }, 3000);
    return () => clearTimeout(timer);
  }, [validationError]);

  // Handles sending the finalized rail path to the server simulation
  const submitRoute = useCallback((segments, force = false) => {
    if (phase === PHASES.PLANNING) {
      if (segments.length === 0 && force !== true) {
        setValidationError("Please add a path to submit");
        return;
      }
      setValidationError('');
      gameActions.submitRoute(segments);
    }
  }, [phase, gameActions]);

  // --- DERIVED STATE & INTERMEDIARY CALCULATIONS ---

  const currentGameId = currentGame ? `${currentGame.start.id}-${currentGame.destination.id}` : null;
  const steps = gameResult?.steps || [];
  const isFinished = execStep >= steps.length;
  const currentStep = steps[execStep];
  const lastStep = steps[steps.length - 1];
  const hasFailedStep = steps.some(s => s.isFailed) || gameResult?.isInvalid;

  const showFailOverlay = gameResult?.isInvalid && (
    phase === PHASES.RESULT ||
    (phase === PHASES.EXECUTION && (currentStep?.isFailed || (isFinished && lastStep?.isFailed)))
  );

  const showSuccessOverlay = !gameResult?.isInvalid && steps.length > 0 && (
    phase === PHASES.RESULT ||
    (phase === PHASES.EXECUTION && isFinished && !hasFailedStep)
  );

  // React pattern to reset local state whenever the active game target changes
  if (currentGameId !== prevGameId) {
    setPrevGameId(currentGameId);
    setExecStep(0);
    setValidationError('');
  }

  const handleSegmentClick = (seg) => {
    if (phase !== PHASES.PLANNING) return;

    // Check if already selected
    const isAlreadySelected = selectedRoute.some(
      s => (s[0] === seg.s1_id && s[1] === seg.s2_id) || (s[0] === seg.s2_id && s[1] === seg.s1_id)
    );
    if (isAlreadySelected) return;

    setValidationError('');
    setSelectedRoute([...selectedRoute, [seg.s1_id, seg.s2_id]]);
  };

  if (networkLoading) return <div className="loading-initializing">Initializing Network...</div>;

  return (
    <div className="game-view-container">
      <div className="game-layout">
        <div className="map-section">
          <div className={`network-map-outer ${isExpanded ? 'expanded' : 'standard'}`}>
            <div className={`map-background ${isExpanded ? 'dimmed' : ''}`}
              style={{
                backgroundImage: 'linear-gradient(90deg, transparent 95%, rgba(255,255,255,0.02) 5%), linear-gradient(0deg, transparent 95%, rgba(255,255,255,0.02) 5%)',
                backgroundSize: '40px 20px'
              }}>
            </div>

            <div className={`industrial-frame ${isExpanded ? 'expanded' : 'standard'}`}>
              <GameControls
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
                onSubmit={(force) => submitRoute(selectedRoute, force)}
              />
              <NetworkMap
                selectedRoute={selectedRoute}
                execStep={execStep}
                setExecStep={setExecStep}
                selectedCharacter={selectedCharacter}
                stations={stations}
                lines={lines}
              />
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
              {validationError && (
                <div
                  className="fail-overlay"
                  onClick={() => setValidationError('')}
                  style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                >
                  <span className="fail-overlay-label">SUBMIT ERROR</span>
                  <span className="fail-overlay-reason">{validationError}</span>
                </div>
              )}

            </div>

            <div className="glass-layer"></div>
          </div>
        </div>

        <aside className="sidebar-section">
          {phase === PHASES.SETUP && (
            <div className="sidebar-content">
              <div className="agent-selection">
                <h4 className="agent-selection-title">Select Character</h4>
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
                <div className="planning-route-info">
                  <div className="route-point">
                    <span className="point-name">{currentGame?.start?.name.toUpperCase()}</span>
                  </div>
                  <div className="route-connector">⬇</div>
                  <div className="route-point">
                    <span className="point-name">{currentGame?.destination?.name.toUpperCase()}</span>
                  </div>
                </div>
              </div>
              <div className="planning-content">
                <RouteBuilder
                  selectedRoute={selectedRoute}
                  stations={stations}
                  onUndo={() => setSelectedRoute(prev => prev.slice(0, -1))}
                  segments={segments}
                  onSegmentClick={handleSegmentClick}
                />
              </div>
            </div>
          )}

          {(phase === PHASES.EXECUTION || phase === PHASES.RESULT) && (
            <JourneyLog
              gameResult={gameResult}
              phase={phase}
              execStep={execStep}
              stations={stations}
            />
          )}
        </aside>
      </div>
    </div>
  );
}

function GameView() {
  // Check if there is an active user session
  const { user } = useAuth();

  // If no user is logged in, show the introductory instructions instead of the game
  if (!user) return <Instructions />;

  return (
    <GameProvider>
      <GameLayout />
    </GameProvider>
  );
}

export default GameView;

