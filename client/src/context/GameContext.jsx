import { createContext, useContext, useEffect, useState } from "react";
import { socket } from "../services/socket.js";

const GameContext = createContext(null);
const playerIdKey = "pulse-quiz-player-id";
const sessionRoleKey = "pulse-quiz-role";
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
    answerReview: [],
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
      if (pin && sessionStorage.getItem(sessionRoleKey) === "host")
        socket.emit("host:rejoin", {
          pin,
          hostToken: sessionStorage.getItem("pulse-host-token"),
        });
      if (pin && sessionStorage.getItem(sessionRoleKey) === "player")
        socket.emit("player:rejoin", { pin, playerId: getPlayerId() });
    };
    const onDisconnect = () => update({ connectionStatus: "reconnecting" });
    const onCreated = ({ pin, hostToken }) => {
      console.log("[quiz] game created", pin);
      sessionStorage.setItem("pulse-pin", pin);
      sessionStorage.setItem("pulse-host-token", hostToken);
      sessionStorage.setItem(sessionRoleKey, "host");
      update({
        role: "host",
        pin,
        phase: "WAITING",
        answerReview: [],
        error: "",
      });
    };
    const onLobby = ({ pin, phase, players }) =>
      update({ pin, phase, players: players || [] });
    const onHostState = ({ pin, phase, players, leaderboard, question, results }) =>
      update({
        role: "host",
        pin,
        phase,
        players: players || [],
        leaderboard: leaderboard || [],
        question,
        results,
        error: "",
      });
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
    const onFinished = ({ leaderboard, answerReview }) =>
      setGame((current) => ({
        ...current,
        phase: "FINISHED",
        leaderboard: leaderboard || [],
        answerReview: current.role === "player" ? answerReview || [] : [],
      }));
    const onState = ({ pin, phase, player, players, leaderboard, results, answerReview }) => {
      if (sessionStorage.getItem(sessionRoleKey) === "host") return;
      sessionStorage.setItem("pulse-pin", pin);
      update({
        role: "player",
        pin,
        phase,
        players: players || [],
        nickname: player.nickname,
        score: player.score,
        leaderboard: leaderboard || [],
        results: results ? { ...results, personal: results.playerResults?.[player.playerId] } : null,
        question: null,
        answerReview: answerReview || [],
        error: "",
      });
    };
    const onSubmitted = () => update({ selectedAnswer: "submitted" });
    const onError = ({ message }) => update({ error: message });
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("game:created", onCreated);
    socket.on("game:lobby", onLobby);
    socket.on("host:state", onHostState);
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
      socket.off("host:state", onHostState);
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
      sessionStorage.removeItem("pulse-pin");
      sessionStorage.removeItem("pulse-host-token");
      sessionStorage.setItem(sessionRoleKey, "host");
      setGame((current) => ({
        ...current,
        role: "host",
        pin: "",
        phase: "WAITING",
        error: "",
      }));
      socket.emit("host:create-game");
    },
    joinGame: (pin, nickname) => {
      sessionStorage.removeItem("pulse-pin");
      setGame((current) => ({
        ...current,
        role: "player",
        pin: "",
        nickname,
        answerReview: [],
        error: "",
      }));
      sessionStorage.setItem(sessionRoleKey, "player");
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
