import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNetwork } from '../hooks/useNetwork';
import { useGame, PHASES } from '../hooks/useGame';

// Modular Components
import Instructions from '../components/Instructions';
import NetworkMap from '../components/NetworkMap';
import GameHeader from '../components/game/GameHeader';
import RouteBuilder from '../components/game/RouteBuilder';
import JourneyLog from '../components/game/JourneyLog';

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
  } = useGame(segments, stations);

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
  if (networkLoading) return <div className="p-8 text-center font-bold">Initializing Network...</div>;

  return (
    <div className="w-full px-4 md:px-8 py-6 pb-20 min-h-[calc(100vh-64px)] flex flex-col">
      <GameHeader
        phase={phase}
        PHASES={PHASES}
        currentGame={currentGame}
        timeLeft={timeLeft}
        onStart={startGame}
        onSubmit={submitRoute}
        onRestart={() => setPhase(PHASES.SETUP)}
      />

      <div className="flex-1 flex flex-col lg:flex-row gap-6">
        {/* Main Section: Network View (Massive Estate) */}
        <div className="flex-1 w-full order-1 lg:order-1 flex flex-col min-h-[500px] lg:min-h-[750px]">
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
            currentStationId={
              phase === PHASES.PLANNING || phase === PHASES.EXECUTION
                ? (selectedRoute.length === 0 ? currentGame?.start.id : selectedRoute[selectedRoute.length - 1].s2_id)
                : (phase === PHASES.RESULT)
                  ? (gameResult?.steps[execStep]?.isFailed
                    ? gameResult.steps[execStep].segment.s1_id
                    : (selectedRoute.length === 0 ? currentGame?.start.id : selectedRoute[selectedRoute.length - 1].s2_id))
                  : null
            }
            highlightStations={
              phase === PHASES.PLANNING || phase === PHASES.EXECUTION || phase === PHASES.RESULT
                ? [currentGame?.start.id, currentGame?.destination.id]
                : []
            }
          />
        </div>

        {/* Sidebar Section: Game Controls & Feedback (Fixed Width, Full Height) */}
        <aside className="w-full lg:w-[350px] xl:w-[420px] order-2 lg:order-2 border-2 border-slate-800 rounded-xl bg-slate-900 overflow-hidden shadow-lg flex flex-col flex-shrink-0 lg:max-h-[85vh]">
          {phase === PHASES.SETUP && (
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              <h3 className="font-black text-sm text-slate-500 uppercase tracking-[0.2em] border-b-2 border-slate-800 pb-3">Mission Protocol</h3>
              <div className="bg-blue-900/20 p-5 border-l-4 border-blue-600 rounded shadow-sm text-sm leading-relaxed text-blue-300 italic font-medium">
                "Identify the optimal sequence through the grid. Terminal access expires in 90 seconds."
              </div>

              {/* Character Selection */}
              <div className="space-y-4">
                <h4 className="font-black text-[10px] text-slate-500 uppercase tracking-widest">Select Agent</h4>
                <div className="grid grid-cols-5 gap-2">
                  {Object.keys(CHARACTERS).map(char => (
                    <button
                      key={char}
                      onClick={() => setSelectedCharacter(char)}
                      className={`p-1 rounded border-2 transition-all ${selectedCharacter === char ? 'border-blue-500 bg-blue-500/20 scale-110' : 'border-slate-800 bg-slate-800/30 hover:border-slate-600'}`}
                    >
                      <img src={CHARACTERS[char].idle} alt={char} className="w-full h-auto" />
                    </button>
                  ))}
                </div>
                <p className="text-center text-[10px] font-black text-blue-400 uppercase">{selectedCharacter}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700 flex items-center justify-between group hover:border-blue-500 transition-colors">
                  <span className="text-3xl group-hover:scale-110 transition-transform">📍</span>
                  <div className="text-right">
                    <span className="block text-[10px] font-black text-slate-500 uppercase">Nodes</span>
                    <span className="text-2xl font-black text-slate-200">{stations.length}</span>
                  </div>
                </div>
                <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700 flex items-center justify-between group hover:border-blue-500 transition-colors">
                  <span className="text-3xl group-hover:scale-110 transition-transform">🚇</span>
                  <div className="text-right">
                    <span className="block text-[10px] font-black text-slate-500 uppercase">Lines</span>
                    <span className="text-2xl font-black text-slate-200">{lines.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {phase === PHASES.PLANNING && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 bg-blue-600 text-white shadow-md">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Final Destination</p>
                <p className="text-xl font-black">{currentGame?.destination.name.toUpperCase()}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-8">
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
