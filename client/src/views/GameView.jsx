import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GameProvider, useGameContext, useNetworkContext, PHASES } from '../contexts/GameContext';
import Instructions from '../components/layout/Instructions';
import NetworkMap from '../components/network/NetworkMap';
import RouteBuilder from '../components/game/RouteBuilder';
import JourneyLog from '../components/game/JourneyLog';
import { CHARACTERS } from '../components/network/CharacterSprite';
import { useTimer } from '../hooks/useTimer';
import './GameView.css';

function GameLayout() {
  const {
    phase,
    currentGame,
    gameResult,
    startGame,
    submitRoute,
    resetToSetup,
    finishGame
  } = useGameContext();

  const { stations, lines, loading: networkLoading } = useNetworkContext();

  const [selectedRoute, setSelectedRoute] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState('Player');
  const [execStep, setExecStep] = useState(0);

  // Auto-submit the route when timer expires
  const handleForceSubmit = useCallback(async () => {
    await submitRoute(selectedRoute);
  }, [selectedRoute, submitRoute]);

  const { timeLeft, start: startTimer } = useTimer(
    phase === PHASES.PLANNING,
    handleForceSubmit
  );

  const handleStartGame = useCallback(async () => {
    const game = await startGame();
    if (game) {
      setSelectedRoute([game.start.id]);
    } else {
      setSelectedRoute([]);
    }
    setExecStep(0);
    startTimer(90);
  }, [startGame, startTimer]);

  const handleResetToSetup = useCallback(() => {
    resetToSetup();
    setSelectedRoute([]);
    setExecStep(0);
  }, [resetToSetup]);

  const handleSubmitRoute = useCallback(async () => {
    await submitRoute(selectedRoute);
    setExecStep(0);
  }, [selectedRoute, submitRoute]);

  if (networkLoading) return <div className="loading-initializing">Initializing Network...</div>;

  return (
    <div className="game-view-container">
      <div className="game-layout">
        <div className="map-section">
          <NetworkMap
            key={currentGame ? `${currentGame.start.id}-${currentGame.destination.id}` : 'setup'}
            phase={phase}
            currentGame={currentGame}
            gameResult={gameResult}
            selectedRoute={selectedRoute}
            timeLeft={timeLeft}
            selectedCharacter={selectedCharacter}
            stations={stations}
            lines={lines}
            startGame={handleStartGame}
            submitRoute={handleSubmitRoute}
            resetToSetup={handleResetToSetup}
            setSelectedRoute={setSelectedRoute}
            setExecStep={setExecStep}
            finishGame={finishGame}
          />
        </div>

        <aside className="sidebar-section">
          {phase === PHASES.SETUP && (
            <div className="sidebar-content">
              <h3 className="sidebar-header">Mission Protocol</h3>
              <div className="mission-quote">
                "Identify the optimal sequence through the grid. Terminal access expires in 90 seconds."
              </div>

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
                  onUndo={() => setSelectedRoute(prev => prev.slice(0, -1))}
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
              lines={lines}
            />
          )}
        </aside>
      </div>
    </div>
  );
}

function GameView() {
  const { user } = useAuth();
  if (!user) return <Instructions />;
  return (
    <GameProvider>
      <GameLayout />
    </GameProvider>
  );
}

export default GameView;

