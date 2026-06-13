import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { user, login, logout } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      setError('');
    } catch (err) {
      setError('Error');
    }
  };

  return (
    <nav className="border-b border-slate-800 p-4 flex justify-between items-center bg-slate-900 text-slate-200">
      <div className="flex gap-6 items-center">
        <Link to="/" className="text-xl font-bold text-blue-400">Last Race</Link>
        <div className="flex gap-4 text-sm">
          <NavLink to="/" className={({ isActive }) => isActive ? 'font-bold text-white' : 'text-slate-400 hover:text-white transition'}>Game</NavLink>
          <NavLink to="/ranking" className={({ isActive }) => isActive ? 'font-bold text-white' : 'text-slate-400 hover:text-white transition'}>Ranking</NavLink>
        </div>
      </div>

      <div>
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm">Hi, {user.username}</span>
            <button onClick={logout} className="text-sm border border-slate-700 px-2 py-1 hover:bg-slate-800 transition">Logout</button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="flex gap-2 text-sm">
            <input 
              type="text" placeholder="User" value={username} onChange={e => setUsername(e.target.value)}
              className="bg-slate-800 border border-slate-700 p-1 w-24 focus:outline-none focus:border-blue-500" required 
            />
            <input 
              type="password" placeholder="Pass" value={password} onChange={e => setPassword(e.target.value)}
              className="bg-slate-800 border border-slate-700 p-1 w-24 focus:outline-none focus:border-blue-500" required 
            />
            <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition">Login</button>
          </form>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
