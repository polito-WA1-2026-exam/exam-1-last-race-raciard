import { Link } from 'react-router-dom';
import './Instructions.css';

function Instructions() {
  return (
    <div className="instructions-container">
      <h1 className="view-title instructions-title">How to Play</h1>

      <div className="instructions-content">
        <section>
          <h2 className="instructions-section-title">The Objective</h2>
          <p className="instructions-text">Subway networks are often confusing! This game will test if you are able to reconstruct a path from a <span className="text-start">Start</span> station to a <span className="text-destination">Destination</span>, navigating the layout and planning your route strategically.</p>
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
                <span className="phase-description">Watch your character travel. Each time you cross a station, a random event occurs that can affect your score or journey!</span>
              </div>
            </li>
          </ul>
        </section>

        <div className="ready-container">
          <span className="ready-text">Ready to Play?</span>
          <Link to="/login" className="login-link">
            <button className="btn btn-primary login-button">Login</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Instructions;
