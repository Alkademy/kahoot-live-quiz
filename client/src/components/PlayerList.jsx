export default function PlayerList({ players = [] }) {
  return (
    <div className="player-list">
      {players.map((player) => (
        <div className="player-chip" key={player.playerId}>
          <span
            className={
              player.connected === false ? "offline-dot" : "online-dot"
            }
          />
          {player.nickname}
        </div>
      ))}
    </div>
  );
}
