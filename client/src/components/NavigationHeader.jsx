import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavigationHeader({ rightContent, onHome, dashboardMode = false, homeMode = false }) {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleHome = (event) => {
    if (!onHome) return;
    event.preventDefault();
    onHome();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="topbar">
      <Link className="brand-lockup" to="/" onClick={handleHome}>
        <span className="brand-dot" /> PULSE QUIZ
      </Link>
      {rightContent || (
        <div className="auth-nav">
          {isLoggedIn && user ? (
            <div className={dashboardMode || homeMode ? "auth-links" : "user-menu"}>
              {(dashboardMode || homeMode) && (
                <Link to="/dashboard" className="button button-small button-ghost">
                  Dashboard
                </Link>
              )}
              <button onClick={handleLogout} className="button button-small">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-links">
                <Link to="/dashboard" className="button button-small button-primary">
                  Dashboard
                </Link>
              <Link to="/login" className="button button-small button-ghost">
                Log In
              </Link>
              <Link to="/signup" className="button button-small button-primary">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
