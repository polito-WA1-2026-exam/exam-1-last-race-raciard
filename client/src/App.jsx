import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import GameView from './views/GameView/GameView';
import RankingView from './views/RankingView/RankingView';
import LoginView from './views/LoginView/LoginView';
import Navbar from './components/Navbar';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<GameView />} />
              <Route path="/ranking" element={<RankingView />} />
              <Route path="/login" element={<LoginView />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
