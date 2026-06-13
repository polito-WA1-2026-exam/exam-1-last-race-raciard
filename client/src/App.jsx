import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import GameView from './views/GameView';
import RankingView from './views/RankingView';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-950 text-slate-200 transition-colors duration-300">
          <Navbar />
          <main className="w-full">
            <Routes>
              <Route path="/" element={<GameView />} />
              <Route path="/ranking" element={<RankingView />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
