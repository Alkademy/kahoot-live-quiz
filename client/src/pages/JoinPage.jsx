import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext.jsx";
import NavigationHeader from "../components/NavigationHeader.jsx";
export default function JoinPage() {
  const [pin, setPin] = useState("");
  const [nickname, setNickname] = useState("");
  const { joinGame, error, connectionStatus } = useGame();
  const navigate = useNavigate();
  const submit = (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(pin) || !nickname.trim() || nickname.trim().length > 20)
      return;
    joinGame(pin, nickname.trim());
    const wait = setInterval(() => {
      if (sessionStorage.getItem("pulse-pin") === pin) {
        clearInterval(wait);
        navigate(`/play/game/${pin}`);
      }
    }, 50);
    setTimeout(() => clearInterval(wait), 3000);
  };
  return (
    <main className="page-shell form-page">
      <NavigationHeader
        rightContent={<span className="connection">{connectionStatus}</span>}
      />
      <section className="form-card join-card">
        <p className="eyebrow">PLAYER ENTRY</p>
        <h1>
          Find your
          <br />
          <em>game.</em>
        </h1>
        <form onSubmit={submit}>
          <label>
            Game PIN
            <input
              inputMode="numeric"
              maxLength="6"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
            />
          </label>
          <label>
            Nickname
            <input
              maxLength="20"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Your name"
            />
          </label>
          {error && <p className="error-message">{error}</p>}
          <button
            className="button button-primary wide"
            disabled={connectionStatus !== "connected"}
          >
            Join game <span>→</span>
          </button>
          <button
            type="button"
            className="text-button"
            onClick={() => navigate("/")}
          >
            Back to home
          </button>
        </form>
      </section>
    </main>
  );
}
