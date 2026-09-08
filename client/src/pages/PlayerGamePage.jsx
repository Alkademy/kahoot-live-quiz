import { useParams, useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext.jsx";
import CountdownTimer from "../components/CountdownTimer.jsx";
import AnswerButton from "../components/AnswerButton.jsx";
import Leaderboard from "../components/Leaderboard.jsx";
import AnswerReview from "../components/AnswerReview.jsx";
import NavigationHeader from "../components/NavigationHeader.jsx";

export default function PlayerGamePage() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const {
    phase,
    nickname,
    players,
    question,
    selectedAnswer,
    results,
    leaderboard,
    playerId,
    score,
    answer,
    answerReview,
    role,
  } = useGame();
  const entry = leaderboard.find((item) => item.playerId === playerId);
  const leaveHome = () => {
    if (phase !== "FINISHED" && !window.confirm("Leave this active game?"))
      return;
    navigate("/");
  };
  if (phase === "WAITING")
    return (
      <main className="player-shell">
        <NavigationHeader onHome={leaveHome} />
        <p className="eyebrow">ROOM {pin}</p>
        <div className="waiting-mark">✓</div>
        <h1>
          You're <em>in.</em>
        </h1>
        <p className="welcome">Welcome, {nickname}</p>
        <p className="muted">Waiting for the host to start...</p>
        <p className="player-count">{players.length} players joined</p>
        <button className="text-button" onClick={leaveHome}>
          Back to home
        </button>
      </main>
    );
  if (phase === "QUESTION" && question)
    return (
      <main className="player-shell">
        <NavigationHeader onHome={leaveHome} />
        <div className="player-head">
          <span>
            Q {question.questionNumber}/{question.totalQuestions}
          </span>
          <CountdownTimer endTime={question.endTime} />
        </div>
        <h1 className="player-question">{question.question}</h1>
        {selectedAnswer === "submitted" ? (
          <div className="submitted">
            <b>Answer submitted!</b>
            <span>Waiting for everyone else...</span>
          </div>
        ) : (
          <div className="answers">
            {question.options.map((text, index) => (
              <AnswerButton
                key={text}
                index={index}
                text={text}
                disabled={selectedAnswer !== null}
                onClick={answer}
              />
            ))}
          </div>
        )}
        <button className="text-button" onClick={leaveHome}>
          Back to home
        </button>
      </main>
    );
  if (phase === "RESULTS" && results)
    return (
      <main className="player-shell result-screen">
        <NavigationHeader onHome={leaveHome} />
        <p className="eyebrow">ROUND COMPLETE</p>
        <h1>{results.personal?.correct ? "Correct!" : "Not quite."}</h1>
        <h2>
          Correct answer: <em>{results.correctText}</em>
        </h2>
        <p className="result-points">
          +{results.personal?.points?.toLocaleString() || "0"} points
        </p>
        <div className="personal-stat">
          <span>Total score</span>
          <b>
            {results.personal?.score?.toLocaleString() ||
              score.toLocaleString()}
          </b>
        </div>
        <div className="personal-stat">
          <span>Current rank</span>
          <b>#{entry?.rank || "—"}</b>
        </div>
        <p className="muted">The host will reveal the leaderboard.</p>
        <button className="text-button" onClick={leaveHome}>
          Back to home
        </button>
      </main>
    );
  if (phase === "LEADERBOARD")
    return (
      <main className="player-shell">
        <NavigationHeader onHome={leaveHome} />
        <p className="eyebrow">LEADERBOARD</p>
        <h1>
          Keep <em>climbing.</em>
        </h1>
        <Leaderboard entries={leaderboard} playerId={playerId} />
        <button className="text-button" onClick={leaveHome}>
          Back to home
        </button>
      </main>
    );
  if (phase === "FINISHED")
    return (
      <main className="player-shell result-screen">
        <NavigationHeader onHome={leaveHome} />
        <p className="eyebrow">GAME OVER</p>
        <h1>
          Nice <em>run.</em>
        </h1>
        <div className="personal-stat">
          <span>Your rank</span>
          <b>#{entry?.rank || "—"}</b>
        </div>
        <div className="personal-stat">
          <span>Your score</span>
          <b>{entry?.score?.toLocaleString() || 0}</b>
        </div>
        <div className="personal-stat">
          <span>Correct answers</span>
          <b>{entry?.correctAnswers || 0} / 10</b>
        </div>
        {role === "player" && <AnswerReview entries={answerReview} />}
        <button
          className="button button-primary wide"
          onClick={() => navigate("/")}
        >
          Back home
        </button>
      </main>
    );
  return <main className="player-shell">Loading game...</main>;
}
