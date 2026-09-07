export function getPlayerId() { const key = 'pulse-quiz-player-id'; let id = localStorage.getItem(key); if (!id) { id = crypto.randomUUID(); localStorage.setItem(key, id); } return id; }
