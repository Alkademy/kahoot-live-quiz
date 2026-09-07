import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth-token'));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkUser = async () => {
      if (token) {
        try {
          const response = await fetch(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('auth-token');
            setToken(null);
          }
        } catch (err) {
          console.error('Error checking user:', err);
          localStorage.removeItem('auth-token');
          setToken(null);
        }
      }
      setIsLoading(false);
    };
    checkUser();
  }, [token]);

  const signup = async (username, email, password, confirmPassword) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, confirmPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Signup failed');
        setIsLoading(false);
        return false;
      }

      localStorage.setItem('auth-token', data.token);
      setToken(data.token);
      setUser(data.user);
      setIsLoading(false);
      return true;
    } catch (err) {
      setError(err.message || 'Signup error');
      setIsLoading(false);
      return false;
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setIsLoading(false);
        return false;
      }

      localStorage.setItem('auth-token', data.token);
      setToken(data.token);
      setUser(data.user);
      setIsLoading(false);
      return true;
    } catch (err) {
      setError(err.message || 'Login error');
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth-token');
    setToken(null);
    setUser(null);
    setError('');
  };

  const value = {
    user,
    token,
    isLoading,
    error,
    isLoggedIn: !!user,
    signup,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
