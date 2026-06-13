import React from 'react';
import RankingRow from './RankingRow';

function RankingTable({ ranking }) {
  return (
    <div className="overflow-hidden border border-slate-800 rounded-lg shadow-xl">
      <table className="w-full text-left bg-slate-900">
        <thead className="bg-slate-800/50 border-b border-slate-800">
          <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <th className="py-3 px-4">Rank</th>
            <th className="py-3 px-4">Player</th>
            <th className="py-3 px-4 text-right">Best Score</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map((row, index) => (
            <RankingRow 
              key={row.username}
              rank={index + 1}
              username={row.username}
              score={row.best_score}
              isTopThree={index < 3}
            />
          ))}
          {ranking.length === 0 && (
            <tr>
              <td colSpan="3" className="py-12 text-center text-xs text-gray-400 italic uppercase">
                No missions completed yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default RankingTable;
