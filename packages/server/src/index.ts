import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import type { ClientToServerEvents, ServerToClientEvents } from '@ledger/common';
import { RoomManager } from './room-manager';
import { GameEngine } from './game-engine';
import { SessionManager } from './session-manager';
import { RateLimiter } from './rate-limiter';
import { registerLobbyHandlers } from './handlers/lobby.events';
import { registerGameHandlers } from './handlers/game.events';
import { registerChatHandlers } from './handlers/chat.events';

const PORT = process.env.PORT || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const httpServer = createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

const roomManager = new RoomManager();
const gameEngine = new GameEngine();
const sessionManager = new SessionManager();
const rateLimiter = new RateLimiter({ windowMs: 60000, maxRequests: 100 });

const onLobbyConnection = registerLobbyHandlers(io, roomManager, gameEngine, sessionManager, rateLimiter);
const onGameConnection = registerGameHandlers(io, gameEngine, roomManager, sessionManager, rateLimiter);
const onChatConnection = registerChatHandlers(io, roomManager, sessionManager, rateLimiter);

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Register lobby event handlers for this socket
  onLobbyConnection(socket);

  // Register game event handlers for this socket
  onGameConnection(socket);

  // Register chat event handlers for this socket
  onChatConnection(socket);
});

// Cleanup expired sessions every hour
setInterval(() => sessionManager.cleanupExpiredSessions(), 60 * 60 * 1000);

// Cleanup empty rooms every 5 minutes
setInterval(() => {
  const removed = roomManager.cleanupEmptyRooms();
  if (removed > 0) console.log(`[cleanup] Removed ${removed} empty room(s)`);
}, 5 * 60 * 1000);

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
