function RankingRow({ rank, username, score, isTopThree }) {
  const getRankBadge = () => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}.`;
  };

  return (
    <tr className={`ranking-row ${isTopThree ? 'top-three' : ''}`}>
      <td className="rank-badge">{getRankBadge()}</td>
      <td>
        <span className="player-name">{username}</span>
      </td>
      <td className="text-right">
        <span className="best-score">{score}</span>
        <span className="score-unit">Coins</span>
      </td>
    </tr>
  );
}

export default RankingRow;
