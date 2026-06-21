import RankingRow from './RankingRow';
import './RankingTable.css';

function RankingTable({ ranking }) {
  return (
    <div className="ranking-table-container">
      <table className="ranking-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th className="text-right">Best Score</th>
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
              <td colSpan="3" className="empty-ranking">
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
