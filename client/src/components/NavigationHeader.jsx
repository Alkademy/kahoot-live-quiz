import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavigationHeader({ rightContent, onHome }) {
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
            <div className="user-menu">
              <span className="username">{user.username}</span>
              <button onClick={handleLogout} className="button button-small">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-links">
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
