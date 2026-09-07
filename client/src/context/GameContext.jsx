import { createContext, useContext, useEffect, useState } from "react";
import { socket } from "../services/socket.js";

const GameContext = createContext(null);
const playerIdKey = "pulse-quiz-player-id";
function getPlayerId() {
  let id = localStorage.getItem(playerIdKey);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(playerIdKey, id);
  }
  return id;
}

export function GameProvider({ children }) {
  const [game, setGame] = useState({
    socket,
    role: null,
    pin: "",
    nickname: "",
    playerId: getPlayerId(),
    phase: "WAITING",
    players: [],
    question: null,
    selectedAnswer: null,
    results: null,
    leaderboard: [],
    score: 0,
    rank: null,
    connectionStatus: socket.connected ? "connected" : "connecting",
    error: "",
  });
  useEffect(() => {
    const update = (patch) => setGame((current) => ({ ...current, ...patch }));
    const onConnect = () => {
      console.log("[quiz] socket connected", socket.id);
      update({ connectionStatus: "connected" });
      const pin = sessionStorage.getItem("pulse-pin");
      if (pin) socket.emit("player:rejoin", { pin, playerId: getPlayerId() });
    };
    const onDisconnect = () => update({ connectionStatus: "reconnecting" });
    const onCreated = ({ pin }) => {
      console.log("[quiz] game created", pin);
      sessionStorage.setItem("pulse-pin", pin);
      update({ role: "host", pin, phase: "WAITING", error: "" });
    };
    const onLobby = ({ pin, phase, players }) =>
      update({ pin, phase, players: players || [] });
    const onQuestion = (question) =>
      update({
        phase: "QUESTION",
        question,
        selectedAnswer: null,
        results: null,
      });
    const onResults = (results) => {
      const personal = results.playerResults?.[getPlayerId()];
      update({
        phase: "RESULTS",
        results: { ...results, personal },
        leaderboard: results.leaderboard || [],
        score: personal?.score ?? game.score,
      });
    };
    const onLeaderboard = ({ leaderboard }) =>
      update({ phase: "LEADERBOARD", leaderboard: leaderboard || [] });
    const onFinished = ({ leaderboard }) =>
      update({ phase: "FINISHED", leaderboard: leaderboard || [] });
    const onState = ({ pin, phase, player, leaderboard }) =>
      update({
        pin,
        phase,
        nickname: player.nickname,
        score: player.score,
        leaderboard: leaderboard || [],
        error: "",
      });
    const onSubmitted = () => update({ selectedAnswer: "submitted" });
    const onError = ({ message }) => update({ error: message });
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("game:created", onCreated);
    socket.on("game:lobby", onLobby);
    socket.on("game:question", onQuestion);
    socket.on("game:results", onResults);
    socket.on("game:leaderboard", onLeaderboard);
    socket.on("game:finished", onFinished);
    socket.on("game:state", onState);
    socket.on("answer:submitted", onSubmitted);
    socket.on("game:error", onError);
    if (socket.connected) onConnect();
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("game:created", onCreated);
      socket.off("game:lobby", onLobby);
      socket.off("game:question", onQuestion);
      socket.off("game:results", onResults);
      socket.off("game:leaderboard", onLeaderboard);
      socket.off("game:finished", onFinished);
      socket.off("game:state", onState);
      socket.off("answer:submitted", onSubmitted);
      socket.off("game:error", onError);
    };
  }, []);
  const actions = {
    createGame: () => {
      console.log("[quiz] emitting host:create-game");
      updateRole("host");
      socket.emit("host:create-game");
    },
    joinGame: (pin, nickname) => {
      sessionStorage.setItem("pulse-pin", pin);
      setGame((current) => ({
        ...current,
        role: "player",
        pin,
        nickname,
        error: "",
      }));
      socket.emit("player:join", { pin, nickname, playerId: getPlayerId() });
    },
    startGame: () => socket.emit("host:start-game", { pin: game.pin }),
    nextQuestion: () => socket.emit("host:next-question", { pin: game.pin }),
    showLeaderboard: () =>
      socket.emit("host:show-leaderboard", { pin: game.pin }),
    endGame: () => socket.emit("host:end-game", { pin: game.pin }),
    answer: (answerIndex) => {
      if (game.selectedAnswer === null)
        socket.emit("player:answer", {
          pin: game.pin,
          playerId: getPlayerId(),
          answerIndex,
        });
    },
  };
  function updateRole(role) {
    setGame((current) => ({ ...current, role }));
  }
  return (
    <GameContext.Provider value={{ ...game, ...actions }}>
      {children}
    </GameContext.Provider>
  );
}
export function useGame() {
  return useContext(GameContext);
}
