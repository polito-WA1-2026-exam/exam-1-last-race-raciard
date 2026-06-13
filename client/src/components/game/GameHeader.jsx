import React from 'react';

function GameHeader({ phase, PHASES, currentGame, timeLeft, onStart, onSubmit, onRestart }) {
  const getTitle = () => {
    switch(phase) {
      case PHASES.SETUP: return 'Game Setup';
      case PHASES.PLANNING: return 'Route Planning';
      case PHASES.EXECUTION: return 'Journey Execution';
      case PHASES.RESULT: return 'Final Results';
      default: return 'Last Race';
    }
  };

  const getSubTitle = () => {
    if (phase === PHASES.PLANNING && currentGame) {
      return `Target: ${currentGame.start.name} to ${currentGame.destination.name}`;
    }
    return 'Find the best path through the network.';
  };

  return (
    <header className="border-b border-slate-800 pb-4 mb-6 flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-black text-slate-200 uppercase">{getTitle()}</h2>
        <p className="text-sm text-slate-500 font-medium">{getSubTitle()}</p>
      </div>
      
      <div className="flex items-center gap-4">
        {phase === PHASES.SETUP && (
          <button 
            onClick={onStart} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded shadow-sm transition"
          >
            START RACE
          </button>
        )}
        
        {phase === PHASES.PLANNING && (
          <>
            <div className={`text-2xl font-mono font-bold ${timeLeft < 20 ? 'text-red-600' : 'text-blue-600'}`}>
              {String(timeLeft).padStart(2, '0')}s
            </div>
            <button 
              onClick={onSubmit} 
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded shadow-sm transition"
            >
              FINISH PLAN
            </button>
          </>
        )}
        
        {phase === PHASES.RESULT && (
          <button 
            onClick={onRestart} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded shadow-sm transition"
          >
            NEW GAME
          </button>
        )}
      </div>
    </header>
  );
}

export default GameHeader;
