import { registerHostHandlers } from './hostHandlers.js';
import { registerPlayerHandlers } from './playerHandlers.js';
import { getGame, findPlayer } from '../game/gameManager.js';

export function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    registerHostHandlers(io, socket); registerPlayerHandlers(io, socket);
    socket.on('disconnect', () => { const pin = socket.data.playerPin; const game = getGame(pin); const player = findPlayer(game, socket.data.playerId); if (player && player.id === socket.id) { player.connected = false; io.to(pin).emit('game:lobby', { pin, phase: game.phase, players: Object.values(game.players).map(({ playerId, nickname, connected, answered }) => ({ playerId, nickname, connected, answered })) }); } if (game?.hostId === socket.id) io.to(pin).emit('game:error', { message: 'Host disconnected. Waiting for host...' }); });
  });
}
