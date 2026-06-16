import React from 'react';
import './JourneyLog.css';

function JourneyLog({ gameResult, execStep, stations, phase, PHASES }) {
  return (
    <div className="journey-log-container">
      <div className="score-display">
        <p className="score-label">Current Score</p>
        <p className="score-value">
          {phase === PHASES.EXECUTION 
            ? (execStep === 0 ? 20 : gameResult.steps[execStep - 1]?.coins || 0)
            : gameResult.score
          }
        </p>
      </div>
      
      <div className="log-content">
        <h4 className="log-header">Journey Log</h4>
        
        {gameResult.steps.length === 0 ? (
          <div className="failure-card">
            <p className="failure-title">SYSTEM_FAILURE</p>
            <p className="failure-message">
              {gameResult.error || 'NETWORK_DISCONTINUITY_DETECTED'}
            </p>
          </div>
        ) : (
          <div className="step-list">
            {gameResult.steps.slice(0, execStep).map((step, i) => (
              <div key={i} className="step-card">
                <p className="step-route">
                  {stations.find(s => s.id === step.segment.s1_id)?.name} → {stations.find(s => s.id === step.segment.s2_id)?.name}
                </p>
                <p className="step-event">"{step.event.description}"</p>
                <p className={`step-effect ${step.event.effect >= 0 ? 'effect-positive' : 'effect-negative'}`}>
                  {step.event.effect >= 0 ? '+' : ''}{step.event.effect} COINS
                </p>
              </div>
            ))}
            
            {phase === PHASES.RESULT && gameResult.steps.length > 0 && !gameResult.isInvalid && (
              <div className="mission-clear animate-pulse">
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
