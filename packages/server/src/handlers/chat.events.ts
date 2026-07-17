import type { Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@ledger/common';
import { SocketEvents } from '@ledger/common';
import { RoomManager } from '../room-manager';
import type { SessionManager } from '../session-manager';
import type { RateLimiter } from '../rate-limiter';

export function registerChatHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  roomManager: RoomManager,
  sessionManager: SessionManager,
  rateLimiter: RateLimiter,
) {
  return (socket: Socket<ClientToServerEvents, ServerToClientEvents>): void => {
    /* ─── Send Chat Message ─── */
    socket.on(SocketEvents.CHAT_SEND, ({ text }) => {
      const mapping = roomManager.lookupSocket(socket.id);
      if (!mapping) return;

      // Rate limit chat messages
      if (!rateLimiter.checkLimit(`chat:${mapping.playerId}`)) {
        socket.emit(SocketEvents.SYSTEM_ERROR, { message: 'Chat too fast. Slow down.' });
        return;
      }

      const trimmed = text.trim();
      if (!trimmed || trimmed.length > 500) return;

      const lobby = roomManager.getRoom(mapping.roomCode);
      if (!lobby) return;

      const player = lobby.players.find((p) => p.id === mapping.playerId);
      if (!player) return;

      io.to(mapping.roomCode).emit(SocketEvents.CHAT_MESSAGE, {
        playerId: mapping.playerId,
        playerName: player.name,
        text: trimmed,
        timestamp: Date.now(),
      });
    });
  };
}
