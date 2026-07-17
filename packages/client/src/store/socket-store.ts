import { create } from 'zustand';

export interface SocketState {
  /** Whether the socket is currently connected */
  isConnected: boolean;
  /** Server-assigned socket ID */
  socketId: string | null;
  /** Transport used (websocket / polling) */
  transport: string | null;
}

export interface SocketActions {
  setConnected: (id: string) => void;
  setDisconnected: (reason?: string) => void;
  setTransport: (transport: string) => void;
}

export type SocketStore = SocketState & SocketActions;

export const useSocketStore = create<SocketStore>((set) => ({
  isConnected: false,
  socketId: null,
  transport: null,

  setConnected: (id) =>
    set({ isConnected: true, socketId: id }),

  setDisconnected: (_reason?) =>
    set({ isConnected: false, socketId: null }),

  setTransport: (transport) =>
    set({ transport }),
}));
