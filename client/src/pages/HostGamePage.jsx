import { useParams, Link, useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext.jsx";
import PlayerList from "../components/PlayerList.jsx";
import Leaderboard from "../components/Leaderboard.jsx";
import CountdownTimer from "../components/CountdownTimer.jsx";
import NavigationHeader from "../components/NavigationHeader.jsx";

export default function HostGamePage() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const {
    phase,
    players,
    question,
    results,
    leaderboard,
    startGame,
    nextQuestion,
    showLeaderboard,
    endGame,
    error,
  } = useGame();
  const answered = players.filter((player) => player.answered).length;
  const leaveHome = () => {
    if (phase !== "FINISHED" && !window.confirm("Leave this active game?"))
      return;
    navigate("/");
  };
  if (phase === "FINISHED")
    return (
      <main className="game-shell projector">
        <NavigationHeader
          onHome={leaveHome}
          rightContent={<span>HOST VIEW</span>}
        />
        <p className="eyebrow">FINAL RESULTS</p>
        <h1>
          The room is <em>done.</em>
        </h1>
        <Leaderboard entries={leaderboard} />
        <button className="button button-ghost" onClick={() => navigate("/")}>
          Home
        </button>
      </main>
    );
  if (phase === "WAITING")
    return (
      <main className="game-shell projector">
        <NavigationHeader
          onHome={leaveHome}
          rightContent={<span>HOST VIEW</span>}
        />
        <p className="eyebrow">JOIN THE GAME</p>
        <div className="pin-display">{pin}</div>
        <p className="muted">Share this PIN with your players</p>
        <section className="lobby-grid">
          <div>
            <h2>
              {players.length} <small>PLAYERS</small>
            </h2>
            <PlayerList players={players} />
          </div>
          <div className="host-actions">
            <button className="button button-primary wide" onClick={startGame}>
              Start game <span>→</span>
            </button>
            <button className="text-button" onClick={endGame}>
              End room
            </button>
            <button className="text-button" onClick={leaveHome}>
              Back to home
            </button>
          </div>
        </section>
        {error && <p className="error-message">{error}</p>}
      </main>
    );
  if (phase === "QUESTION" && question)
    return (
      <main className="game-shell projector">
        <NavigationHeader
          onHome={leaveHome}
          rightContent={<span>HOST VIEW</span>}
        />
        <p className="eyebrow">
          QUESTION {question.questionNumber} OF {question.totalQuestions}
        </p>
        <CountdownTimer endTime={question.endTime} />
        <h1 className="question-title">{question.question}</h1>
        <p className="answered-count">{answered} players answered</p>
        <button className="text-button" onClick={leaveHome}>
          Back to home
        </button>
      </main>
    );
  if (phase === "RESULTS" && results)
    return (
      <main className="game-shell projector">
        <NavigationHeader
          onHome={leaveHome}
          rightContent={<span>HOST VIEW</span>}
        />
        <p className="eyebrow">RESULTS</p>
        <h1>
          Correct answer: <em>{results.correctText}</em>
        </h1>
        <p className="result-note">Answers are in. See who is rising.</p>
        <button className="button button-primary" onClick={showLeaderboard}>
          View leaderboard <span>→</span>
        </button>
        <button className="text-button" onClick={leaveHome}>
          Back to home
        </button>
      </main>
    );
  if (phase === "LEADERBOARD")
    return (
      <main className="game-shell projector">
        <NavigationHeader
          onHome={leaveHome}
          rightContent={<span>HOST VIEW</span>}
        />
        <p className="eyebrow">LEADERBOARD</p>
        <h1>
          Keep <em>climbing.</em>
        </h1>
        <Leaderboard entries={leaderboard} />
        <button className="button button-primary" onClick={nextQuestion}>
          {question?.questionNumber === 5 ? "Finish game" : "Next question"}{" "}
          <span>→</span>
        </button>
        <button className="text-button" onClick={leaveHome}>
          Back to home
        </button>
      </main>
    );
  return (
    <main className="game-shell projector">
      <p>Loading room {pin}...</p>
    </main>
  );
}
