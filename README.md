# Live Quiz App

Pulse Quiz is a real-time classroom quiz app. A host creates a room, players join with a six-digit PIN, and Socket.io synchronizes questions, countdowns, scoring, results, and leaderboards.

## Features

- Host mode with projector-friendly lobby and controls
- Player mode with mobile-first answer controls
- Unique six-digit game PINs and Socket.io rooms
- Server-controlled 15-second countdown and speed scoring
- Ten general-knowledge starter questions
- Live lobby, results, leaderboard, final scores, and personal rank
- Persistent player ID with basic reconnection support
- Host disconnect messaging and in-memory game data

## Tech Stack

React, Vite, React Router, Node.js, Express.js, Socket.io, Socket.io Client, and plain CSS.

## Installation

```bash
cd kahoot-live-quiz
npm install
cd client && npm install
cd ../server && npm install
cd ..
npm run dev
```

The frontend runs at http://localhost:5173 and the backend runs at http://localhost:5000. Copy `client/.env.example` to `client/.env` when configuring another backend URL and set both `VITE_SERVER_URL` and `VITE_API_URL`. Configure `CLIENT_URL`, `JWT_SECRET` (at least 32 characters), and the `MYSQL_*` variables on the server.

The root `npm run dev` uses `concurrently` to run both services. Games are stored in server memory for this MVP and disappear when the server restarts.
