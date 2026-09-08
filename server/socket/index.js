import { registerHostHandlers } from './hostHandlers.js';
import { registerPlayerHandlers } from './playerHandlers.js';
import { getGame, findPlayer } from '../game/gameManager.js';

export function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    registerHostHandlers(io, socket); registerPlayerHandlers(io, socket);
    socket.on('disconnect', () => {
      const playerPin = socket.data.playerPin;
      const playerGame = getGame(playerPin);
      const player = findPlayer(playerGame, socket.data.playerId);
      if (player && player.id === socket.id) {
        player.connected = false;
        io.to(playerPin).emit('game:lobby', { pin: playerPin, phase: playerGame.phase, players: Object.values(playerGame.players).map(({ playerId, nickname, connected, answered }) => ({ playerId, nickname, connected, answered })) });
      }
      const hostPin = socket.data.hostPin;
      const hostGame = getGame(hostPin);
      if (hostGame?.hostId === socket.id) io.to(hostPin).emit('game:error', { message: 'Host disconnected. Waiting for host...' });
    });
  });
}
