import React from 'react';

function RankingRow({ rank, username, score, isTopThree }) {
  const getRankBadge = () => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}.`;
  };

  return (
    <tr className={`border-b border-slate-800 last:border-0 ${isTopThree ? 'bg-blue-900/10' : ''}`}>
      <td className="py-4 px-4 font-bold text-slate-500">{getRankBadge()}</td>
      <td className="py-4 px-4">
        <span className="font-bold text-slate-200 uppercase tracking-tighter">{username}</span>
      </td>
      <td className="py-4 px-4 text-right">
        <span className="font-black text-blue-400 tabular-nums">{score}</span>
        <span className="text-[10px] ml-1 text-slate-500 uppercase font-bold">Coins</span>
      </td>
    </tr>
  );
}

export default RankingRow;
