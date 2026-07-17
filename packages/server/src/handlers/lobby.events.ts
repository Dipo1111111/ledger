import type { Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@ledger/common';
import { SocketEvents } from '@ledger/common';
import { RoomManager } from '../room-manager';
import { GameEngine } from '../game-engine';
import { SessionManager } from '../session-manager';
import { RateLimiter } from '../rate-limiter';
import { scheduleTurnTimer } from './game.events';

/** Prevents duplicate reconnect attempts within a short window. */
const reconnecting = new Set<string>();

export function registerLobbyHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  roomManager: RoomManager,
  gameEngine: GameEngine,
  sessionManager: SessionManager,
  rateLimiter: RateLimiter,
) {
  return (socket: Socket<ClientToServerEvents, ServerToClientEvents>): void => {
    /* --- Create Room --- */
    socket.on(SocketEvents.CREATE_ROOM, ({ playerName }) => {
      // Rate limit check
      if (!rateLimiter.checkLimit(`create:${socket.id}`)) {
        socket.emit(SocketEvents.SYSTEM_ERROR, { message: 'Too many requests. Please try again.' });
        return;
      }

      // Validate player name
      const cleanName = playerName.trim().replace(/[^\w\s\-'.]/g, '').slice(0, 20);
      if (!cleanName) {
        socket.emit(SocketEvents.SYSTEM_ERROR, { message: 'Invalid player name.' });
        return;
      }

      const { lobby, playerId } = roomManager.createRoom(cleanName);
      roomManager.trackSocket(socket.id, lobby.code, playerId);

      // Create session token
      const sessionToken = sessionManager.createSession(playerId, lobby.code);

      socket.join(lobby.code);
      socket.emit(SocketEvents.ROOM_CREATED, {
        roomCode: lobby.code,
        playerId,
        sessionToken, // Send token to client
      });
      socket.emit(SocketEvents.LOBBY_UPDATE, {
        players: lobby.players,
        settings: lobby.settings,
      });
    });

    /* --- Join Room --- */
    socket.on(SocketEvents.JOIN_ROOM, ({ roomCode, playerName }) => {
      // Rate limit check
      if (!rateLimiter.checkLimit(`join:${socket.id}`)) {
        socket.emit(SocketEvents.SYSTEM_ERROR, { message: 'Too many requests. Please try again.' });
        return;
      }

      // Validate player name
      const cleanName = playerName.trim().replace(/[^\w\s\-'.]/g, '').slice(0, 20);
      if (!cleanName) {
        socket.emit(SocketEvents.SYSTEM_ERROR, { message: 'Invalid player name.' });
        return;
      }

      const result = roomManager.joinRoom(roomCode, cleanName);

      if ('error' in result) {
        socket.emit(SocketEvents.SYSTEM_ERROR, { message: result.error });
        return;
      }

      roomManager.trackSocket(socket.id, roomCode.toUpperCase(), result.playerId);
      socket.join(roomCode.toUpperCase());

      // Create session token
      const sessionToken = sessionManager.createSession(result.playerId, roomCode.toUpperCase());

      // Tell the joining player about the room
      socket.emit(SocketEvents.ROOM_CREATED, {
        roomCode: roomCode.toUpperCase(),
        playerId: result.playerId,
        sessionToken, // Send token to client
      });

      // Broadcast updated lobby to everyone in the room
      io.to(roomCode.toUpperCase()).emit(SocketEvents.LOBBY_UPDATE, {
        players: result.lobby.players,
        settings: result.lobby.settings,
      });
    });

    /* --- Leave Room --- */
    socket.on(SocketEvents.LEAVE_ROOM, () => {
      const mapping = roomManager.lookupSocket(socket.id);
      if (!mapping) return;

      // Invalidate session
      sessionManager.invalidateSession(mapping.playerId);

      const result = roomManager.leaveRoom(mapping.roomCode, mapping.playerId);
      roomManager.untrackSocket(socket.id);
      socket.leave(mapping.roomCode);

      if (result) {
        io.to(mapping.roomCode).emit(SocketEvents.LOBBY_UPDATE, {
          players: result.lobby.players,
          settings: result.lobby.settings,
        });
      }
    });

    /* --- Set Ready --- */
    socket.on(SocketEvents.SET_READY, ({ isReady }) => {
      const mapping = roomManager.lookupSocket(socket.id);
      if (!mapping) return;

      // Rate limit check
      if (!rateLimiter.checkLimit(`action:${mapping.playerId}`)) {
        socket.emit(SocketEvents.SYSTEM_ERROR, { message: 'Too many requests.' });
        return;
      }

      const lobby = roomManager.getRoom(mapping.roomCode);
      if (!lobby) return;

      const player = lobby.players.find((p) => p.id === mapping.playerId);
      if (!player) return;

      // Host cannot toggle ready
      if (player.isHost) return;

      player.isReady = isReady;

      io.to(mapping.roomCode).emit(SocketEvents.LOBBY_UPDATE, {
        players: lobby.players,
        settings: lobby.settings,
      });
    });

    /* --- Update Settings --- */
    socket.on(SocketEvents.SETTINGS_UPDATE, (payload) => {
      const mapping = roomManager.lookupSocket(socket.id);
      if (!mapping) return;

      const lobby = roomManager.getRoom(mapping.roomCode);
      if (!lobby) return;

      // Only host can update settings
      if (lobby.hostId !== mapping.playerId) return;

      if (payload.maxPlayers !== undefined) {
        lobby.settings.maxPlayers = Math.max(2, Math.min(6, payload.maxPlayers));
      }
      if (payload.turnTimerSeconds !== undefined) {
        lobby.settings.turnTimerSeconds = Math.max(25, Math.min(300, payload.turnTimerSeconds));
      }

      io.to(mapping.roomCode).emit(SocketEvents.LOBBY_UPDATE, {
        players: lobby.players,
        settings: lobby.settings,
      });
    });

    /* --- Start Game --- */
    socket.on(SocketEvents.START_GAME, () => {
      const mapping = roomManager.lookupSocket(socket.id);
      if (!mapping) return;

      const lobby = roomManager.getRoom(mapping.roomCode);
      if (!lobby) return;

      // Only host can start
      if (lobby.hostId !== mapping.playerId) return;

      // Minimum players check
      if (lobby.players.length < 2) {
        socket.emit(SocketEvents.SYSTEM_ERROR, {
          message: 'Need at least 2 players to start',
        });
        return;
      }

      // Initialize game engine
      const gameState = gameEngine.startGame(mapping.roomCode, lobby);

      // Schedule the first turn timer
      scheduleTurnTimer(mapping.roomCode, gameState, gameEngine, io);

      io.to(mapping.roomCode).emit(SocketEvents.GAME_STARTING, {
        gameState,
      });
    });

    /* --- Reconnect (in-game) --- */
    socket.on(SocketEvents.RECONNECT, ({ roomCode, playerId, sessionToken }) => {
      // Prevent reconnect races (rapid duplicate calls)
      if (reconnecting.has(playerId)) return;
      reconnecting.add(playerId);

      // Validate session token if provided
      if (sessionToken) {
        const session = sessionManager.validateSession(sessionToken);
        if (!session || session.playerId !== playerId || session.roomCode !== roomCode) {
          socket.emit(SocketEvents.SYSTEM_ERROR, { message: 'Invalid session. Please rejoin.' });
          reconnecting.delete(playerId);
          return;
        }
      }

      // Verify the player exists in the game
      const gs = gameEngine.getGame(roomCode);
      if (!gs || gs.phase !== 'in_progress') {
        socket.emit(SocketEvents.SYSTEM_ERROR, { message: 'No active game to reconnect to' });
        reconnecting.delete(playerId);
        return;
      }

      const player = gs.players.find((p) => p.id === playerId);
      if (!player || player.isEliminated) {
        socket.emit(SocketEvents.SYSTEM_ERROR, { message: 'Player not found or eliminated' });
        reconnecting.delete(playerId);
        return;
      }

      // Mark them connected & reassign socket
      gameEngine.setPlayerConnected(roomCode, playerId, true);
      roomManager.trackSocket(socket.id, roomCode, playerId);
      socket.join(roomCode);

      // Send full game state + lobby info
      socket.emit(SocketEvents.GAME_STARTING, { gameState: gs });

      const lobby = roomManager.getRoom(roomCode);
      if (lobby) {
        socket.emit(SocketEvents.LOBBY_UPDATE, {
          players: lobby.players,
          settings: lobby.settings,
        });
      }

      // Notify the room
      io.to(roomCode).emit(SocketEvents.PLAYER_RECONNECTED, {
        playerId,
        playerName: player.name,
      });

      // Release lock after a short delay
      setTimeout(() => reconnecting.delete(playerId), 1000);

    });

    /* --- Disconnect (Lobby vs In-Game) --- */
    socket.on('disconnect', () => {
      const mapping = roomManager.lookupSocket(socket.id);
      if (!mapping) return;

      // Check if there's an active game in this room
      const gameState = gameEngine.getGame(mapping.roomCode);
      const isInGame = gameState && gameState.phase === 'in_progress';

      if (isInGame) {
        // In-game disconnect — mark disconnected, DON'T remove from room
        gameEngine.setPlayerConnected(mapping.roomCode, mapping.playerId, false);
        roomManager.untrackSocket(socket.id);

        const player = gameState.players.find((p) => p.id === mapping.playerId);
        io.to(mapping.roomCode).emit(SocketEvents.PLAYER_DISCONNECTED, {
          playerId: mapping.playerId,
          playerName: player?.name ?? 'Unknown',
        });

        const activePlayers = gameState.players.filter((p) => !p.isEliminated);
        if (activePlayers.length <= 2) {
          if (player && !player.isEliminated) {
            gameEngine.handleAbandon(mapping.roomCode, mapping.playerId);
          }
        }

        // Broadcast updated game state so all clients see isConnected status
        io.to(mapping.roomCode).emit(SocketEvents.STATE_UPDATE, {
          gameState,
        });
      } else {
        // Lobby disconnect — remove from room (existing behavior)
        const result = roomManager.leaveRoom(mapping.roomCode, mapping.playerId);
        roomManager.untrackSocket(socket.id);

        if (result) {
          io.to(mapping.roomCode).emit(SocketEvents.LOBBY_UPDATE, {
            players: result.lobby.players,
            settings: result.lobby.settings,
          });
        }
      }
    });
  };
}
