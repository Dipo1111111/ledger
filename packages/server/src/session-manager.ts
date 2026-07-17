import crypto from 'crypto';

export interface Session {
  token: string;
  playerId: string;
  roomCode: string;
  createdAt: number;
  lastActivity: number;
}

export class SessionManager {
  private sessions = new Map<string, Session>(); // token -> Session
  private playerSessions = new Map<string, string>(); // playerId -> token

  /**
   * Create a new session token for a player
   */
  createSession(playerId: string, roomCode: string): string {
    // Invalidate any existing session for this player
    const existingToken = this.playerSessions.get(playerId);
    if (existingToken) {
      this.sessions.delete(existingToken);
    }

    const token = crypto.randomBytes(32).toString('hex');
    const now = Date.now();

    const session: Session = {
      token,
      playerId,
      roomCode,
      createdAt: now,
      lastActivity: now,
    };

    this.sessions.set(token, session);
    this.playerSessions.set(playerId, token);

    return token;
  }

  /**
   * Validate a session token
   */
  validateSession(token: string): Session | null {
    const session = this.sessions.get(token);
    if (!session) return null;

    // Update last activity
    session.lastActivity = Date.now();

    return session;
  }

  /**
   * Get session by player ID
   */
  getPlayerSession(playerId: string): Session | null {
    const token = this.playerSessions.get(playerId);
    if (!token) return null;
    return this.sessions.get(token) ?? null;
  }

  /**
   * Invalidate a session
   */
  invalidateSession(playerId: string): void {
    const token = this.playerSessions.get(playerId);
    if (token) {
      this.sessions.delete(token);
      this.playerSessions.delete(playerId);
    }
  }

  /**
   * Invalidate all sessions for a room
   */
  invalidateRoomSessions(roomCode: string): void {
    for (const [token, session] of this.sessions.entries()) {
      if (session.roomCode === roomCode) {
        this.sessions.delete(token);
        this.playerSessions.delete(session.playerId);
      }
    }
  }

  /**
   * Clean up expired sessions (older than 24 hours)
   */
  cleanupExpiredSessions(maxAgeMs: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    for (const [token, session] of this.sessions.entries()) {
      if (now - session.createdAt > maxAgeMs) {
        this.sessions.delete(token);
        this.playerSessions.delete(session.playerId);
      }
    }
  }
}
