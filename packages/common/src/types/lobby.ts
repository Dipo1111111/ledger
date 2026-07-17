export interface LobbyPlayer {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  color: PlayerColor;
  joinedAt: number;
}

export type PlayerColor =
  | 'blue'
  | 'green'
  | 'red'
  | 'gold'
  | 'purple'
  | 'teal';

export const PLAYER_COLORS: PlayerColor[] = [
  'blue',
  'green',
  'red',
  'gold',
  'purple',
  'teal',
];

export interface LobbySettings {
  maxPlayers: number;
  turnTimerSeconds: number;
}

export interface Lobby {
  code: string;
  hostId: string;
  players: LobbyPlayer[];
  settings: LobbySettings;
  createdAt: number;
}
