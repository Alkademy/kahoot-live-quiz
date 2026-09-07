import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import HostPage from './pages/HostPage.jsx';
import HostGamePage from './pages/HostGamePage.jsx';
import JoinPage from './pages/JoinPage.jsx';
import PlayerGamePage from './pages/PlayerGamePage.jsx';
import './styles/global.css';
import './styles/auth.css';

export default function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/host" element={<HostPage />} />
            <Route path="/host/game/:pin" element={<HostGamePage />} />
            <Route path="/play" element={<JoinPage />} />
            <Route path="/play/game/:pin" element={<PlayerGamePage />} />
          </Routes>
        </BrowserRouter>
      </GameProvider>
    </AuthProvider>
  );
}

