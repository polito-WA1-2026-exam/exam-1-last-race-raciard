import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getRanking } from '../../services/api';
import RankingTable from './components/RankingTable/RankingTable';
import './RankingView.css';

function RankingView() {
  const { user } = useAuth();
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRanking = async () => {
    try {
      const data = await getRanking();
      setRanking(data);
    } catch (err) {
      console.error('Failed to fetch ranking', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    Promise.resolve().then(() => {
      fetchRanking();
    });
  }, [user]);

  // Redirect to home if not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text animate-pulse">Loading Leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="ranking-view">
      <div className="ranking-header">
        <h1 className="view-title ranking-title">Global Ranking</h1>
        <p className="ranking-subtitle">Top performers in the underground network.</p>
      </div>
      
      <RankingTable ranking={ranking} />
      
      <div className="ranking-footer">
        <button 
          onClick={fetchRanking}
          className="refresh-button"
        >
          Refresh Scores
        </button>
      </div>
    </div>
  );
}

export default RankingView;
