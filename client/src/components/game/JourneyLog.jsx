import React from 'react';

function JourneyLog({ gameResult, execStep, stations, phase, PHASES }) {
  return (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="text-center py-6 bg-slate-800/30 border-b border-slate-800">
        <p className="text-xs text-slate-500 uppercase font-black tracking-widest mb-1">Current Score</p>
        <p className="text-5xl font-black text-blue-500">
          {phase === PHASES.EXECUTION 
            ? (execStep === 0 ? 20 : gameResult.steps[execStep - 1]?.coins || 0)
            : gameResult.score
          }
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <h4 className="font-black text-xs text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Journey Log</h4>
        
        {gameResult.steps.length === 0 ? (
          <div className="bg-red-900/10 p-4 border border-red-900/30 text-center rounded">
            <p className="text-red-500 font-bold text-sm uppercase">SYSTEM_FAILURE</p>
            <p className="text-[11px] text-red-400 mt-1 uppercase">
              {gameResult.error || 'NETWORK_DISCONTINUITY_DETECTED'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {gameResult.steps.slice(0, execStep).map((step, i) => (
              <div key={i} className="text-sm border-l-4 border-blue-600 bg-slate-800/50 p-3 shadow-md border-t border-r border-b border-slate-700/50 transition-colors">
                <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">
                  {stations.find(s => s.id === step.segment.s1_id)?.name} → {stations.find(s => s.id === step.segment.s2_id)?.name}
                </p>
                <p className="font-bold text-slate-200 leading-tight">"{step.event.description}"</p>
                <p className={`text-[11px] font-black mt-2 ${step.event.effect >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {step.event.effect >= 0 ? '+' : ''}{step.event.effect} COINS
                </p>
              </div>
            ))}
            
            {phase === PHASES.RESULT && gameResult.steps.length > 0 && !gameResult.isInvalid && (
              <div className="bg-blue-600 p-4 text-white text-center font-black uppercase tracking-widest shadow-lg rounded animate-pulse">
                Mission Clear! 🎉
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default JourneyLog;
