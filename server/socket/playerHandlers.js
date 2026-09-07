import { getGame, addPlayer, findPlayer, finishQuestion, leaderboard } from '../game/gameManager.js';
import { lobby, startTimer } from './hostHandlers.js';

export function registerPlayerHandlers(io, socket) {
  socket.on('player:join', ({ pin, nickname, playerId }) => {
    const cleanPin = String(pin || '').trim(); const cleanName = String(nickname || '').trim(); const game = getGame(cleanPin);
    if (!/^\d{6}$/.test(cleanPin)) return error(socket, 'Please enter a 6-digit PIN.');
    if (!game) return error(socket, 'Game not found.');
    if (game.phase !== 'WAITING') return error(socket, 'That game has already started.');
    if (!cleanName || cleanName.length > 20) return error(socket, 'Nickname must be 1-20 characters.');
    if (Object.values(game.players).some((p) => p.nickname.toLowerCase() === cleanName.toLowerCase() && p.playerId !== playerId)) return error(socket, 'Nickname is already being used.');
    const player = findPlayer(game, playerId) || addPlayer(game, socket.id, playerId, cleanName); player.id = socket.id; player.connected = true; player.nickname = cleanName;
    socket.data.playerPin = cleanPin; socket.data.playerId = playerId; socket.join(cleanPin); socket.emit('game:state', stateForPlayer(game, player)); io.to(cleanPin).emit('game:lobby', lobby(game));
  });
  socket.on('player:rejoin', ({ pin, playerId }) => { const game = getGame(pin); const player = findPlayer(game, playerId); if (!game || !player) return error(socket, 'This player session is no longer available.'); player.id = socket.id; player.connected = true; socket.data.playerPin = pin; socket.data.playerId = playerId; socket.join(pin); socket.emit('game:state', stateForPlayer(game, player)); io.to(pin).emit('game:lobby', lobby(game)); if (game.phase === 'QUESTION') socket.emit('game:question', publicQuestion(game)); });
  socket.on('player:answer', ({ pin, playerId, answerIndex }) => { const game = getGame(pin); const player = findPlayer(game, playerId); const index = Number(answerIndex); if (!game || !player || player.id !== socket.id) return error(socket, 'Player session not found.'); if (game.phase !== 'QUESTION' || Date.now() > game.questionEndTime) return error(socket, "Time's up. Answers are closed."); if (player.answered || !Number.isInteger(index) || index < 0 || index > 3) return error(socket, 'That answer cannot be submitted.'); player.answered = true; player.currentAnswer = index; player.answerTime = Date.now(); socket.emit('answer:submitted'); io.to(pin).emit('game:lobby', lobby(game));
    if (Object.values(game.players).every((p) => p.answered || !p.connected)) { const results = finishQuestion(game); io.to(pin).emit('game:results', results); }
  });
}
function stateForPlayer(game, player) { return { pin: game.pin, phase: game.phase, player: { playerId: player.playerId, nickname: player.nickname, score: player.score, correctAnswers: player.correctAnswers }, leaderboard: leaderboard(game) }; }
function publicQuestion(game) { const q = game.questions[game.currentQuestionIndex]; return { id: q.id, question: q.question, options: q.options, questionNumber: game.currentQuestionIndex + 1, totalQuestions: game.questions.length, startTime: game.questionStartTime, endTime: game.questionEndTime }; }
function error(socket, message) { socket.emit('game:error', { message }); }
