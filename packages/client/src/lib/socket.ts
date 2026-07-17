import { io, Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@ledger/common';

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: TypedSocket | null = null;

// ─── Session Token Management ───

let sessionToken: string | null = localStorage.getItem('ledger_session_token');

/** Store the session token received from the server. */
export function setSessionToken(token: string): void {
  sessionToken = token;
  localStorage.setItem('ledger_session_token', token);
}

/** Get the current session token. */
export function getSessionToken(): string | null {
  return sessionToken;
}

/** Clear the session token. */
export function clearSessionToken(): void {
  sessionToken = null;
  localStorage.removeItem('ledger_session_token');
}

/**
 * Returns the singleton Socket.io client.
 * Uses VITE_SERVER_URL in production, Vite proxy in development.
 */
export function getSocket(): TypedSocket {
  if (!socket) {
    const serverUrl = import.meta.env.VITE_SERVER_URL;
    socket = io(serverUrl || undefined, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

/**
 * Manually create a socket to a specific URL (e.g., for explicit server config).
 */
export function createSocket(url: string): TypedSocket {
  socket?.close();
  socket = io(url, {
    autoConnect: false,
    transports: ['websocket', 'polling'],
  });
  return socket;
}

/** Tear down the singleton (useful for cleanup / tests). */
export function destroySocket(): void {
  socket?.close();
  socket = null;
}
