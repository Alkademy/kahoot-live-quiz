export default function Leaderboard({ entries = [], playerId, limit = 5 }) {
  const visible = entries.slice(0, limit);
  const own = entries.find((entry) => entry.playerId === playerId);
  if (own && !visible.some((entry) => entry.playerId === playerId))
    visible.push(own);
  return (
    <div className="leaderboard">
      {visible.map((entry) => (
        <div
          className={`leader-row ${entry.playerId === playerId ? "leader-self" : ""}`}
          key={entry.playerId}
        >
          <strong>{entry.rank}</strong>
          <span>{entry.nickname}</span>
          <b>{entry.score.toLocaleString()}</b>
        </div>
      ))}
    </div>
  );
}
