import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, login, logout } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      setUsername('');
      setPassword('');
      setError('');
    } catch {
      setError('ACCESS DENIED');
    }
  };

  return (
    <nav className="navbar">
      {/* Left: system identity */}
      <div className="navbar-identity">
        <Link to="/" className="navbar-logo">
          <span className="logo-title">LAST<span className="logo-accent">RACE</span></span>
        </Link>
        <span className="navbar-separator">|</span>
        <div className="navbar-tabs">
          <NavLink to="/" end className={({ isActive }) => `navbar-tab ${isActive ? 'navbar-tab--active' : ''}`}>
            <span className="tab-dot"></span>GAME
          </NavLink>
          <NavLink to="/ranking" className={({ isActive }) => `navbar-tab ${isActive ? 'navbar-tab--active' : ''}`}>
            <span className="tab-dot"></span>RANKING
          </NavLink>
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
          <form onSubmit={handleLogin} className="terminal-form">
            {error && <span className="terminal-error">{error}</span>}
            <span className="terminal-prompt">&gt;_</span>
            <input
              type="text" placeholder="ID" value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              className="terminal-input" required autoComplete="username"
            />
            <input
              type="password" placeholder="KEY" value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              className="terminal-input" required autoComplete="current-password"
            />
            <button type="submit" className="terminal-submit">ACCESS</button>
          </form>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
