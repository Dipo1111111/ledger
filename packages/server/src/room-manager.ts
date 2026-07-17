import type { Lobby, LobbyPlayer, LobbySettings } from '@ledger/common';
import { PLAYER_COLORS } from '@ledger/common';
import type { PlayerColor } from '@ledger/common';

/* ─── Helpers ─── */

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I, O, 0, 1
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function generateId(): string {
  return crypto.randomUUID();
}

/** Sanitize player names: strip non-printable chars, trim, limit length. */
function sanitizeName(name: string): string {
  return name
    .replace(/[^\w\s\-'.]/g, '') // only allow word chars, spaces, hyphens, apostrophes, periods
    .trim()
    .slice(0, 20); // max 20 chars
}

/* ─── Room Manager ─── */

export interface RoomResult {
  lobby: Lobby;
  playerId: string;
}

export interface JoinResult {
  playerId: string;
  lobby: Lobby;
}

export class RoomManager {
  private rooms = new Map<string, Lobby>();
  /** socketId → { roomCode, playerId } */
  readonly socketMap = new Map<string, { roomCode: string; playerId: string }>();

  /* ─── CRUD ─── */

  createRoom(hostName: string): RoomResult {
    let roomCode: string;
    let attempts = 0;
    do {
      roomCode = generateRoomCode();
      attempts++;
    } while (this.rooms.has(roomCode) && attempts < 10);

    const playerId = generateId();
    const lobby: Lobby = {
      code: roomCode,
      hostId: playerId,
      players: [
        {
          id: playerId,
          name: hostName,
          isHost: true,
          isReady: false,
          color: PLAYER_COLORS[0],
          joinedAt: Date.now(),
        },
      ],
      settings: {
        maxPlayers: 6,
        turnTimerSeconds: 25,
      },
      createdAt: Date.now(),
    };

    this.rooms.set(roomCode, lobby);
    return { lobby, playerId };
  }

  joinRoom(roomCode: string, playerName: string): JoinResult | { error: string } {
    const lobby = this.rooms.get(roomCode.toUpperCase());
    if (!lobby) return { error: 'Room not found' };

    if (lobby.players.length >= lobby.settings.maxPlayers) {
      return { error: 'Room is full' };
    }

    const takenColors = new Set<PlayerColor>(lobby.players.map((p) => p.color));
    const availableColor = PLAYER_COLORS.find((c) => !takenColors.has(c)) ?? PLAYER_COLORS[0];

    const playerId = generateId();
    const newPlayer: LobbyPlayer = {
      id: playerId,
      name: playerName,
      isHost: false,
      isReady: false,
      color: availableColor,
      joinedAt: Date.now(),
    };

    lobby.players.push(newPlayer);
    return { playerId, lobby };
  }

  leaveRoom(roomCode: string, playerId: string): { lobby: Lobby; wasHost: boolean } | null {
    const lobby = this.rooms.get(roomCode);
    if (!lobby) return null;

    const idx = lobby.players.findIndex((p) => p.id === playerId);
    if (idx === -1) return null;

    const [leaving] = lobby.players.splice(idx, 1);
    const wasHost = leaving.isHost;

    if (lobby.players.length === 0) {
      this.rooms.delete(roomCode);
      return { lobby, wasHost };
    }

    // If host left, assign next player as host
    if (wasHost) {
      lobby.hostId = lobby.players[0].id;
      lobby.players[0].isHost = true;
    }

    return { lobby, wasHost };
  }

  getRoom(roomCode: string): Lobby | undefined {
    return this.rooms.get(roomCode);
  }

  /**
   * Find which room a player is in by playerId.
   */
  findRoomByPlayerId(playerId: string): { roomCode: string; lobby: Lobby } | undefined {
    for (const [roomCode, lobby] of this.rooms) {
      if (lobby.players.some((p) => p.id === playerId)) {
        return { roomCode, lobby };
      }
    }
    return undefined;
  }

  deleteRoom(roomCode: string): void {
    this.rooms.delete(roomCode);
  }

  /* ─── Socket mapping ─── */

  trackSocket(socketId: string, roomCode: string, playerId: string): void {
    this.socketMap.set(socketId, { roomCode, playerId });
  }

  untrackSocket(socketId: string): void {
    this.socketMap.delete(socketId);
  }

  lookupSocket(socketId: string): { roomCode: string; playerId: string } | undefined {
    return this.socketMap.get(socketId);
  }

  /**
   * Clean up empty rooms that weren't properly removed.
   * Call periodically (e.g. every 5 minutes).
   */
  cleanupEmptyRooms(): number {
    let removed = 0;
    for (const [code, lobby] of this.rooms) {
      if (lobby.players.length === 0) {
        this.rooms.delete(code);
        removed++;
      }
    }
    return removed;
  }

  /** Get current room count (for monitoring). */
  get roomCount(): number {
    return this.rooms.size;
  }
}
