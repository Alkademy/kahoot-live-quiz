import { useEffect } from "react";
import { Link } from "react-router-dom";
import NavigationHeader from "../components/NavigationHeader.jsx";
export default function HomePage() {
  useEffect(() => {
    sessionStorage.removeItem("pulse-pin");
    sessionStorage.removeItem("pulse-host-token");
    sessionStorage.removeItem("pulse-quiz-role");
  }, []);

  return (
    <main className="home page-shell">
      <NavigationHeader homeMode />
      <section className="home-hero">
        <p className="eyebrow">LIVE CLASSROOM PLAY</p>
        <h1>
          Think fast.
          <br />
          <em>Climb higher.</em>
        </h1>
        <p className="hero-copy">
          A bright, real-time quiz arena for curious minds and friendly
          competition.
        </p>
        <div className="home-actions">
          <Link className="button button-primary" to="/host">
            Host a game
            <span>→</span>
          </Link>
          <Link className="button button-ghost" to="/play">
            Join a game
            <span>↗</span>
          </Link>
        </div>
      </section>
      <div className="home-footer">
        <span>10 QUESTIONS</span>
        <span>LIVE • FAST • FAIR</span>
      </div>
    </main>
  );
}
