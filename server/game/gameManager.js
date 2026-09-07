import { questions } from '../data/questions.js';
import { calculateScore } from './scoring.js';

export const games = {};
export const QUESTION_DURATION = 15000;

function makePin() {
  let pin;
  do { pin = String(Math.floor(100000 + Math.random() * 900000)); } while (games[pin]);
  return pin;
}

export function createGame(hostId) {
  const pin = makePin();
  games[pin] = { pin, hostId, phase: 'WAITING', currentQuestionIndex: 0, questionStartTime: null, questionEndTime: null, players: {}, questions };
  return games[pin];
}
export const getGame = (pin) => games[pin];
export function addPlayer(game, id, playerId, nickname) {
  const player = { id, playerId, nickname, score: 0, answered: false, currentAnswer: null, answerTime: null, correctAnswers: 0, connected: true };
  game.players[playerId] = player;
  return player;
}
export function resetAnswers(game) {
  Object.values(game.players).forEach((player) => { player.answered = false; player.currentAnswer = null; player.answerTime = null; });
}
export function startQuestion(game, index) {
  resetAnswers(game);
  game.currentQuestionIndex = index;
  game.phase = 'QUESTION';
  game.questionStartTime = Date.now();
  game.questionEndTime = game.questionStartTime + QUESTION_DURATION;
}
export function publicQuestion(game) {
  const question = game.questions[game.currentQuestionIndex];
  return { id: question.id, question: question.question, options: question.options, image: question.image, questionNumber: game.currentQuestionIndex + 1, totalQuestions: game.questions.length, startTime: game.questionStartTime, endTime: game.questionEndTime };
}
export function leaderboard(game) {
  return Object.values(game.players).sort((a, b) => b.score - a.score || a.nickname.localeCompare(b.nickname)).map((player, index) => ({ rank: index + 1, playerId: player.playerId, nickname: player.nickname, score: player.score, correctAnswers: player.correctAnswers }));
}
export function finishQuestion(game) {
  const question = game.questions[game.currentQuestionIndex];
  game.phase = 'RESULTS';
  Object.values(game.players).forEach((player) => {
    if (player.currentAnswer === question.correctAnswer) {
      player.correctAnswers += 1;
      player.lastPoints = calculateScore(question.points, (player.answerTime || game.questionEndTime) - game.questionStartTime, QUESTION_DURATION);
      player.score += player.lastPoints;
    } else player.lastPoints = 0;
  });
  return { correctAnswer: question.correctAnswer, correctText: question.options[question.correctAnswer], leaderboard: leaderboard(game), playerResults: Object.fromEntries(Object.values(game.players).map((player) => [player.playerId, { correct: player.currentAnswer === question.correctAnswer, points: player.lastPoints, score: player.score }])) };
}
export function findPlayer(game, playerId) { return game && game.players[playerId]; }
export function removeGame(pin) { delete games[pin]; }
