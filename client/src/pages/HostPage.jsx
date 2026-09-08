import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext.jsx";
import NavigationHeader from "../components/NavigationHeader.jsx";
export default function HostPage() {
  const { createGame, connectionStatus, error, pin, phase, role } = useGame();
  const navigate = useNavigate();
  useEffect(() => {
    if (role === "host" && phase === "WAITING" && pin) {
      navigate(`/host/game/${pin}`, { replace: true });
    }
  }, [navigate, phase, pin, role]);

  const start = () => {
    console.log("[quiz] create button clicked");
    createGame();
  };
  return (
    <main className="page-shell form-page">
      <NavigationHeader
        rightContent={<span className="connection">{connectionStatus}</span>}
      />
      <section className="form-card">
        <p className="eyebrow">HOST CONSOLE</p>
        <h1>
          Host a<br />
          <em>live quiz.</em>
        </h1>
        <p className="muted">
          Ten quick-fire questions. One room full of energy.
        </p>
        <div className="quiz-meta">
          <div>
            <b>10</b>
            <span>QUESTIONS</span>
          </div>
          <div>
            <b>15s</b>
            <span>PER QUESTION</span>
          </div>
          <div>
            <b>∞</b>
            <span>PLAYERS</span>
          </div>
        </div>
        {error && <p className="error-message">{error}</p>}
        <button
          className="button button-primary wide"
          onClick={start}
          disabled={connectionStatus !== "connected"}
        >
          Create game <span>→</span>
        </button>
        <button className="text-button" onClick={() => navigate("/")}>
          Back to home
        </button>
      </section>
    </main>
  );
}
