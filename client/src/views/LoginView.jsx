import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import './LoginView.css';

function LoginView() {
  const { user, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect to home if already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(username, password);
    } catch (err) {
      setError('ACCESS RESTRICTED: INVALID CREDENTIALS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-view-container">
      <div className="login-card">
        <div className="login-card-header">
          <h2 className="login-card-title">Login</h2>
          <p className="login-card-subtitle">Sign in to your account to play.</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && (
            <div className="login-error-alert animate-shake">
              <span className="error-icon">⚠️</span> {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <div className="input-container">
              <input
                id="username"
                type="text"
                placeholder="Username"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                className="form-input"
                required
                autoComplete="username"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-container">
              <input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                className="form-input"
                required
                autoComplete="current-password"
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginView;
