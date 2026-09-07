import { useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext.jsx";
import NavigationHeader from "../components/NavigationHeader.jsx";
export default function HostPage() {
  const { createGame, connectionStatus, error } = useGame();
  const navigate = useNavigate();
  const start = () => {
    console.log("[quiz] create button clicked");
    createGame();
    const wait = setInterval(() => {
      const pin = sessionStorage.getItem("pulse-pin");
      if (pin) {
        console.log("[quiz] navigating to host room", pin);
        clearInterval(wait);
        navigate(`/host/game/${pin}`);
      }
    }, 50);
    setTimeout(() => clearInterval(wait), 3000);
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
          Five quick-fire questions. One room full of energy.
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
