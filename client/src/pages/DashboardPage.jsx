import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavigationHeader from "../components/NavigationHeader.jsx";
import { useAuth } from "../context/AuthContext";

const dashboardItems = [
  {
    title: "Join Quiz",
    description: "Enter a game PIN and play with your class.",
    to: "/play",
    action: "Join now",
  },
  {
    title: "Create Quiz",
    description: "Start a live quiz and invite your players.",
    to: "/host",
    action: "Create now",
  },
  {
    title: "My Quizzes",
    description: "Your saved quizzes will appear here when available.",
    action: "Coming soon",
  },
  {
    title: "Profile",
    description: "Manage your account details when profile tools are available.",
    action: "Coming soon",
  },
];

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) navigate("/login", { replace: true });
  }, [isLoading, user, navigate]);

  if (isLoading || !user) {
    return (
      <main className="page-shell dashboard-page">
        <div className="dashboard-loading">Loading your dashboard...</div>
      </main>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <main className="page-shell dashboard-page">
      <NavigationHeader dashboardMode />
      <section className="dashboard-content">
        <div className="dashboard-welcome">
          <p className="eyebrow">YOUR DASHBOARD</p>
          <h1>
            Welcome, <em>{user.username}</em>!
          </h1>
          <p className="hero-copy">Ready to learn something new?</p>
        </div>

        <section className="dashboard-grid" aria-label="Dashboard features">
          {dashboardItems.map((item) => (
            <article className="dashboard-card" key={item.title}>
              <div>
                <p className="dashboard-card-label">PULSE QUIZ</p>
                <h2>{item.title}</h2>
                <p className="muted">{item.description}</p>
              </div>
              {item.to ? (
                <Link className="button button-ghost" to={item.to}>
                  {item.action} <span>→</span>
                </Link>
              ) : (
                <button className="button button-ghost" disabled>
                  {item.action}
                </button>
              )}
            </article>
          ))}
        </section>

        <button className="text-button dashboard-logout" onClick={handleLogout}>
          Log out
        </button>
      </section>
    </main>
  );
}
