import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GameProvider, useGameContext, PHASES } from '../contexts/GameContext';
import { useNetwork } from '../hooks/useNetwork';
import Instructions from '../components/layout/Instructions';
import NetworkMap from '../components/network/NetworkMap';
import GameControls from '../components/network/GameControls';
import RouteBuilder from '../components/game/RouteBuilder';
import JourneyLog from '../components/game/JourneyLog';
import { CHARACTERS } from '../components/network/CharacterSprite';
import './GameView.css';

function GameLayout() {
  const {
    phase,
    currentGame,
    gameResult,
    gameActions,
  } = useGameContext();

  const { stations, lines, loading: networkLoading } = useNetwork();

  const [selectedRoute, setSelectedRoute] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState('Player');
  const [execStep, setExecStep] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const currentGameId = currentGame ? `${currentGame.start.id}-${currentGame.destination.id}` : null;
  const [prevGameId, setPrevGameId] = useState(null);

  if (currentGameId !== prevGameId) {
    setPrevGameId(currentGameId);
    setSelectedRoute(currentGame ? [currentGame.start.id] : []);
    setExecStep(0);
  }

  const submitRoute = (route) => {
    if (phase === PHASES.PLANNING) {
      gameActions.submitRoute(route);
    }
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
                onSubmit={() => submitRoute(selectedRoute)}
              />
              <NetworkMap
                selectedRoute={selectedRoute}
                setSelectedRoute={setSelectedRoute}
                execStep={execStep}
                setExecStep={setExecStep}
                selectedCharacter={selectedCharacter}
                stations={stations}
                lines={lines}
              />
            </div>

            <div className="glass-layer"></div>
          </div>
        </div>

        <aside className="sidebar-section">
          {phase === PHASES.SETUP && (
            <div className="sidebar-content">
              <h3 className="sidebar-header">Mission Protocol</h3>
              <div className="mission-quote">
                Identify the optimal sequence through the Subway Network. You have 90 seconds!
              </div>

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

