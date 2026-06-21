import { useActionState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import './LoginView.css';

function LoginForm(props) {
  const doLogin = async (prevState, formData) => {
    const username = formData.get('username')?.trim();
    const password = formData.get('password');
    
    if (username && password) {
      try {
        await props.userLogin(username, password);
        return { username, password, error: '' };
      } catch {
        return { username, password, error: 'INVALID CREDENTIALS' };
      }
    } else {
      return { username, password, error: 'Please enter both username and password' };
    }
  };

  const [state, formAction, isPending] = useActionState(doLogin, { username: '', password: '', error: '' });

  return (
    <form action={formAction} className="login-form">
      {state.error && (
        <div className="login-error-alert animate-shake">
          <span className="error-icon">⚠️</span> {state.error}
        </div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="username">Username</label>
        <div className="input-container">
          <input
            id="username"
            name="username"
            type="text"
            placeholder="Username"
            defaultValue={state.username}
            className="form-input"
            required
            autoComplete="username"
            disabled={isPending}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="password">Password</label>
        <div className="input-container">
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            defaultValue={state.password}
            className="form-input"
            required
            autoComplete="current-password"
            disabled={isPending}
          />
        </div>
      </div>

      <button type="submit" className="btn btn-primary login-submit-btn" disabled={isPending}>
        {isPending ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}

function LoginView() {
  const { user, login } = useAuth();

  // Redirect to home if already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  const userLoginCallback = async (username, password) => {
    await login(username, password);
  };

  return (
    <div className="login-view-container">
      <div className="login-card">
        <div className="login-card-header">
          <h2 className="login-card-title">Login</h2>
          <p className="login-card-subtitle">Sign in to your account to play.</p>
        </div>

        <LoginForm userLogin={userLoginCallback} />
      </div>
    </div>
  );
}

export default LoginView;
