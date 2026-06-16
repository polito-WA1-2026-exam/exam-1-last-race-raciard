import './Instructions.css';

function Instructions() {
  return (
    <div className="instructions-container">
      <h1 className="instructions-title">How to Play</h1>
      
      <div className="instructions-content">
        <section>
          <h2 className="instructions-section-title">The Objective</h2>
          <p className="instructions-text">Navigate from a <span className="text-start">Start</span> station to a <span className="text-destination">Destination</span>. Score points by reaching the goal with credits remaining.</p>
        </section>

        <section>
          <h2 className="instructions-section-title instructions-section-title-large">Game Phases</h2>
          <ul className="phases-list">
            <li className="phase-item">
               <span className="phase-dot"></span>
               <div>
                  <strong className="phase-title">1. Setup</strong> 
                  <span className="phase-description">View the full network layout and study the connections.</span>
               </div>
            </li>
            <li className="phase-item">
               <span className="phase-dot"></span>
               <div>
                  <strong className="phase-title">2. Planning</strong> 
                  <span className="phase-description">Choose your path within 90 seconds. The lines will be hidden!</span>
               </div>
            </li>
            <li className="phase-item">
               <span className="phase-dot"></span>
               <div>
                  <strong className="phase-title">3. Execution</strong> 
                  <span className="phase-description">Watch your character travel. Random events occur at each stop.</span>
               </div>
            </li>
          </ul>
        </section>

        <section className="critical-rules">
          <h2 className="critical-rules-title">Critical Rules</h2>
          <p className="critical-rules-text">"Change lines only at interchange stations. Routes must be a continuous sequence. Attempting an invalid connection results in immediate system failure."</p>
        </section>
      </div>
    </div>
  );
}

export default Instructions;
