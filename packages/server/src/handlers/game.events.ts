import type { Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@ledger/common';
import { SocketEvents, AFK_MAX_TIMEOUTS } from '@ledger/common';
import { GameEngine } from '../game-engine';
import { RoomManager } from '../room-manager';
import type { SessionManager } from '../session-manager';
import type { RateLimiter } from '../rate-limiter';

/**
 * Track which eliminated players have already been notified per room code,
 * so PLAYER_ELIMINATED is emitted only once per elimination.
 */
const notifiedEliminations = new Map<string, Set<string>>();

/**
 * Per-room turn timers — managed at the handler level since they rely on
 * Socket.io broadcast access for game-over and elimination events.
 */
const turnTimers = new Map<string, NodeJS.Timeout>();

export function clearTurnTimer(roomCode: string): void {
  const existing = turnTimers.get(roomCode);
  if (existing) {
    clearTimeout(existing);
    turnTimers.delete(roomCode);
  }
}

export function scheduleTurnTimer(roomCode: string, state: { turnTimerEndsAt: number | null; phase: string }, engine: GameEngine, io: Server<ClientToServerEvents, ServerToClientEvents>): void {
  // Clear any existing timer
  clearTurnTimer(roomCode);

  if (!state.turnTimerEndsAt || state.phase !== 'in_progress') return;

  const delay = Math.max(0, state.turnTimerEndsAt - Date.now());

  turnTimers.set(roomCode, setTimeout(() => {
    turnTimers.delete(roomCode);

    const timerResult = engine.handleTimerExpiry(roomCode);
    const gs = timerResult.state;
    if (!gs) return;

    // Emit AFK warning if applicable
    if (timerResult.afkWarning) {
      io.to(roomCode).emit(SocketEvents.SYSTEM_ERROR, { message: timerResult.afkWarning });
    }

    // Detect newly eliminated players (auto-surrender)
    const roomEliminated = notifiedEliminations.get(roomCode) ?? new Set();
    notifiedEliminations.set(roomCode, roomEliminated);

    for (const player of gs.players) {
      if (player.isEliminated && !roomEliminated.has(player.id)) {
        roomEliminated.add(player.id);
        const eliminationLog = [...gs.logs].reverse().find(
          (l) => l.playerId === player.id && l.message.toLowerCase().includes('eliminated'),
        );
        io.to(roomCode).emit(SocketEvents.PLAYER_ELIMINATED, {
          playerId: player.id,
          reason: eliminationLog?.message ?? 'Player eliminated',
        });
      }
    }

    // Broadcast updated state
    io.to(roomCode).emit(SocketEvents.STATE_UPDATE, {
      gameState: gs,
    });

    // Emit turn change (timer expiry always advances the turn)
    io.to(roomCode).emit(SocketEvents.TURN_CHANGE, {
      playerId: gs.turnOrder[gs.currentPlayerIndex],
    });

    // Handle takeover resolution if it happened
    if (gs.activeTakeover &&
        (gs.activeTakeover.phase === 'succeeded' || gs.activeTakeover.phase === 'failed')) {
      io.to(roomCode).emit(SocketEvents.TAKEOVER_RESOLVED, {
        attackerId: gs.activeTakeover.attackerId,
        defenderId: gs.activeTakeover.defenderId,
        succeeded: gs.activeTakeover.phase === 'succeeded',
      });
    }

    // Handle game finished
    if (gs.phase === 'finished' && gs.winnerId) {
      io.to(roomCode).emit(SocketEvents.GAME_FINISHED, {
        winnerId: gs.winnerId,
        gameState: gs,
      });
    }

    // Schedule the next timer for the new current player
    scheduleTurnTimer(roomCode, gs, engine, io);
  }, delay));
}

export function registerGameHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  engine: GameEngine,
  roomManager: RoomManager,
  sessionManager: SessionManager,
  rateLimiter: RateLimiter,
) {
  return (socket: Socket<ClientToServerEvents, ServerToClientEvents>): void => {
    /* ─── Game Action ─── */
    socket.on(SocketEvents.GAME_ACTION, ({ action }) => {
      const mapping = roomManager.lookupSocket(socket.id);
      if (!mapping) return;

      // Rate limit game actions per player
      if (!rateLimiter.checkLimit(`action:${mapping.playerId}`)) {
        socket.emit(SocketEvents.SYSTEM_ERROR, { message: 'Slow down! Too many actions.' });
        return;
      }

      const result = engine.handleAction(mapping.roomCode, mapping.playerId, action);

      if (result.error) {
        socket.emit(SocketEvents.SYSTEM_ERROR, { message: result.error });
        return;
      }

      if (!result.state) return;

      // Detect newly eliminated players and emit the dedicated event
      const roomEliminated = notifiedEliminations.get(mapping.roomCode) ?? new Set();
      notifiedEliminations.set(mapping.roomCode, roomEliminated);

      for (const player of result.state.players) {
        if (player.isEliminated && !roomEliminated.has(player.id)) {
          roomEliminated.add(player.id);

          // Grab the precise elimination message from the log
          const eliminationLog = [...result.state.logs].reverse().find(
            (l) => l.playerId === player.id && l.message.toLowerCase().includes('eliminated'),
          );

          io.to(mapping.roomCode).emit(SocketEvents.PLAYER_ELIMINATED, {
            playerId: player.id,
            reason: eliminationLog?.message ?? 'Player eliminated',
          });
        }
      }

      // Broadcast updated state to all players in the room
      io.to(mapping.roomCode).emit(SocketEvents.STATE_UPDATE, {
        gameState: result.state,
      });

      // If the turn changed (end_turn), emit the dedicated event
      if (action.type === 'end_turn') {
        io.to(mapping.roomCode).emit(SocketEvents.TURN_CHANGE, {
          playerId: result.state.turnOrder[result.state.currentPlayerIndex],
        });
      }

      // Takeover declaration event
      if (action.type === 'initiate_takeover' && result.state.activeTakeover) {
        io.to(mapping.roomCode).emit(SocketEvents.TAKEOVER_DECLARED, {
          attackerId: result.state.activeTakeover.attackerId,
          defenderId: result.state.activeTakeover.defenderId,
        });
      }

      // Takeover resolution event (right after a round advances via end_turn)
      if (result.state.activeTakeover &&
          (result.state.activeTakeover.phase === 'succeeded' || result.state.activeTakeover.phase === 'failed')) {
        io.to(mapping.roomCode).emit(SocketEvents.TAKEOVER_RESOLVED, {
          attackerId: result.state.activeTakeover.attackerId,
          defenderId: result.state.activeTakeover.defenderId,
          succeeded: result.state.activeTakeover.phase === 'succeeded',
        });
      }

      // If the game just finished, emit the finished event
      if (result.state.phase === 'finished' && result.state.winnerId) {
        io.to(mapping.roomCode).emit(SocketEvents.GAME_FINISHED, {
          winnerId: result.state.winnerId,
          gameState: result.state,
        });
      }

      // Auction-specific events for real-time UI updates
      if (action.type === 'place_bid' && result.state.activeAuction) {
        io.to(mapping.roomCode).emit(SocketEvents.AUCTION_UPDATE, {
          auction: result.state.activeAuction,
        });
      }

      // Expansion vote update
      if ((action.type === 'request_expansion' || action.type === 'vote_expansion') && result.state.expansionVotes) {
        io.to(mapping.roomCode).emit(SocketEvents.EXPANSION_VOTE_UPDATE, {
          requestedBy: result.state.expansionVotes.requestedBy,
          votes: result.state.expansionVotes.votes,
        });
      }

      // Schedule (or reschedule) the turn timer for the current player
      scheduleTurnTimer(mapping.roomCode, result.state, engine, io);
    });

    /* ─── Dedicated auction bid event (bypasses turn check) ─── */
    socket.on(SocketEvents.AUCTION_PLACE_BID, ({ auctionId, amount }) => {
      const mapping = roomManager.lookupSocket(socket.id);
      if (!mapping) return;

      const action = { type: 'place_bid' as const, auctionId, amount };
      const result = engine.handleAction(mapping.roomCode, mapping.playerId, action);

      if (result.error) {
        socket.emit(SocketEvents.SYSTEM_ERROR, { message: result.error });
        return;
      }

      if (result.state) {
        io.to(mapping.roomCode).emit(SocketEvents.STATE_UPDATE, {
          gameState: result.state,
        });
        if (result.state.activeAuction) {
          io.to(mapping.roomCode).emit(SocketEvents.AUCTION_UPDATE, {
            auction: result.state.activeAuction,
          });
        }
      }
    });

    /* ─── Dedicated auction cancel event ─── */
    socket.on(SocketEvents.AUCTION_CANCEL, ({ auctionId }) => {
      const mapping = roomManager.lookupSocket(socket.id);
      if (!mapping) return;

      const action = { type: 'cancel_auction' as const, auctionId };
      const result = engine.handleAction(mapping.roomCode, mapping.playerId, action);

      if (result.error) {
        socket.emit(SocketEvents.SYSTEM_ERROR, { message: result.error });
        return;
      }

      if (result.state) {
        io.to(mapping.roomCode).emit(SocketEvents.STATE_UPDATE, {
          gameState: result.state,
        });
      }
    });
  };
}
