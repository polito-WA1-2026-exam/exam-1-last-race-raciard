import { useState, useEffect } from 'react';
import api from '../services/api';
import RankingTable from '../components/ranking/RankingTable';

function RankingView() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRanking = async () => {
    try {
      const data = await api.get('/ranking');
      setRanking(data);
    } catch (err) {
      console.error('Failed to fetch ranking', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRanking();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <div className="animate-pulse font-black text-gray-300 uppercase tracking-[0.3em]">Loading Leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-black text-slate-200 uppercase tracking-tighter mb-2">Global Ranking</h1>
        <p className="text-sm text-slate-500 font-medium">Top performers in the underground network.</p>
      </div>
      
      <RankingTable ranking={ranking} />
      
      <div className="mt-8 text-center">
        <button 
          onClick={fetchRanking}
          className="text-[10px] font-bold text-blue-500 hover:text-blue-700 uppercase tracking-widest"
        >
          Refresh Scores
        </button>
      </div>
    </div>
  );
}

export default RankingView;
