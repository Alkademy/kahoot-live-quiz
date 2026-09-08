import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import 'dotenv/config';
import { registerSocketHandlers } from './socket/index.js';
import authRoutes from './routes/auth.js';

const app = express();
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(express.json());
app.use(cors({ origin: clientUrl }));

// Routes
app.get('/', (_req, res) => res.json({ name: 'Pulse Quiz server', status: 'running', api: ['POST /api/auth/signup', 'POST /api/auth/login', 'GET /api/auth/me'], socket: 'Socket.IO' }));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: clientUrl,
    methods: ['GET', 'POST']
  }
});

registerSocketHandlers(io);

const port = process.env.PORT || 5000;
httpServer.listen(port, () => console.log(`Quiz server listening on http://localhost:${port}`));
