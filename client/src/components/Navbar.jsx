import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      {/* Left: system identity */}
      <div className="navbar-identity">
        <Link to="/" className="navbar-logo">
          <span className="logo-title">LAST<span className="logo-accent">RACE</span></span>
        </Link>
        <span className="navbar-separator">|</span>
        <div className="navbar-tabs">
          {user && <NavLink to="/" end className={({ isActive }) => `navbar-tab ${isActive ? 'navbar-tab--active' : ''}`}>
            <span className="tab-dot"></span>GAME
          </NavLink>}
          {user && (
            <NavLink to="/ranking" className={({ isActive }) => `navbar-tab ${isActive ? 'navbar-tab--active' : ''}`}>
              <span className="tab-dot"></span>RANKING
            </NavLink>
          )}
        </div>
      </div>

      {/* Right: agent access */}
      <div className="navbar-auth">
        {user ? (
          <div className="agent-panel">
            <span className="agent-name">{user.username.toUpperCase()}</span>
            <button onClick={logout} className="agent-logout">⏻</button>
          </div>
        ) : (
          <div className="agent-panel-offline">
            <span className="agent-status-dot"></span>
            <span className="agent-status-text">LOGGED OUT</span>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
