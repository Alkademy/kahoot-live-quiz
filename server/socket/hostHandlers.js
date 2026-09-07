import { createGame, getGame, startQuestion, finishQuestion, leaderboard } from '../game/gameManager.js';

export function registerHostHandlers(io, socket) {
  socket.on('host:create-game', () => {
    const game = createGame(socket.id);
    socket.data.hostPin = game.pin;
    socket.join(game.pin);
    socket.emit('game:created', { pin: game.pin });
    io.to(game.pin).emit('game:lobby', lobby(game));
  });
  socket.on('host:start-game', ({ pin }) => {
    const game = getGame(pin);
    if (!game || game.hostId !== socket.id) return socket.emit('game:error', { message: 'Only the host can start this game.' });
    if (!Object.keys(game.players).length) return socket.emit('game:error', { message: 'Invite at least one player first.' });
    startQuestion(game, 0); broadcastQuestion(io, game);
  });
  socket.on('host:next-question', ({ pin }) => {
    const game = getGame(pin);
    if (!game || game.hostId !== socket.id || game.phase !== 'LEADERBOARD') return;
    if (game.currentQuestionIndex >= game.questions.length - 1) { game.phase = 'FINISHED'; io.to(pin).emit('game:finished', { leaderboard: leaderboard(game) }); return; }
    startQuestion(game, game.currentQuestionIndex + 1); broadcastQuestion(io, game);
  });
    socket.on('host:show-leaderboard', ({ pin }) => {
      const game = getGame(pin);
      if (!game || game.hostId !== socket.id || game.phase !== 'RESULTS') return;
      game.phase = 'LEADERBOARD';
      io.to(pin).emit('game:leaderboard', { leaderboard: leaderboard(game) });
    });
  socket.on('host:end-game', ({ pin }) => { const game = getGame(pin); if (game?.hostId === socket.id) { game.phase = 'FINISHED'; io.to(pin).emit('game:finished', { leaderboard: leaderboard(game) }); } });
}
export function lobby(game) { return { pin: game.pin, phase: game.phase, players: Object.values(game.players).map(({ playerId, nickname, connected, answered }) => ({ playerId, nickname, connected, answered })) }; }
export function broadcastQuestion(io, game) { io.to(game.pin).emit('game:question', publicQuestionSafe(game)); startTimer(io, game); }
function publicQuestionSafe(game) { const q = game.questions[game.currentQuestionIndex]; return { id: q.id, question: q.question, options: q.options, image: q.image, questionNumber: game.currentQuestionIndex + 1, totalQuestions: game.questions.length, startTime: game.questionStartTime, endTime: game.questionEndTime }; }
export function startTimer(io, game) { setTimeout(() => { if (game.phase === 'QUESTION' && Date.now() >= game.questionEndTime) { const results = finishQuestion(game); io.to(game.pin).emit('game:results', results); } }, 15050); }
