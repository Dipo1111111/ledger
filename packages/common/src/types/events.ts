import type { LobbyPlayer } from './lobby';
import type { GameState } from './game-state';
import type { PlayerAction } from './actions';
import type { AuctionState } from './auction';

// ─── Event Name Constants ───

export const SocketEvents = {
  /* Client → Server */
  CREATE_ROOM: 'lobby:create_room',
  JOIN_ROOM: 'lobby:join_room',
  LEAVE_ROOM: 'lobby:leave_room',
  SET_READY: 'lobby:set_ready',
  SETTINGS_UPDATE: 'lobby:settings_update',
  START_GAME: 'lobby:start_game',
  RECONNECT: 'lobby:reconnect',
  GAME_ACTION: 'game:action',
  AUCTION_PLACE_BID: 'auction:place_bid',
  AUCTION_CANCEL: 'auction:cancel',
  EXPANSION_REQUEST: 'expansion:request',
  EXPANSION_VOTE: 'expansion:vote',
  CHAT_SEND: 'chat:send',

  /* Server → Client */
  ROOM_CREATED: 'room:created',
  ROOM_JOINED: 'room:player_joined',
  ROOM_LEFT: 'room:player_left',
  LOBBY_UPDATE: 'room:lobby_update',
  GAME_STARTING: 'game:starting',
  STATE_UPDATE: 'game:state_update',
  TURN_CHANGE: 'game:turn_change',
  PLAYER_ELIMINATED: 'game:player_eliminated',
  PLAYER_DISCONNECTED: 'game:player_disconnected',
  PLAYER_RECONNECTED: 'game:player_reconnected',
  GAME_PAUSED: 'game:paused',
  GAME_RESUMED: 'game:resumed',
  EXPANSION_VOTE_UPDATE: 'game:expansion_vote_update',
  TAKEOVER_DECLARED: 'takeover:declared',
  TAKEOVER_RESOLVED: 'takeover:resolved',
  AUCTION_UPDATE: 'auction:update',
  GAME_FINISHED: 'game:finished',
  SYSTEM_ERROR: 'system:error',
  CHAT_MESSAGE: 'chat:message',
} as const;

// ─── Payload Type Maps ───

export interface ServerToClientEvents {
  [SocketEvents.ROOM_CREATED]: (payload: { roomCode: string; playerId: string; sessionToken?: string }) => void;
  [SocketEvents.ROOM_JOINED]: (payload: { player: LobbyPlayer }) => void;
  [SocketEvents.ROOM_LEFT]: (payload: { playerId: string }) => void;
  [SocketEvents.LOBBY_UPDATE]: (payload: { players: LobbyPlayer[]; settings: any }) => void;
  [SocketEvents.GAME_STARTING]: (payload: { gameState: GameState }) => void;
  [SocketEvents.STATE_UPDATE]: (payload: { gameState: GameState }) => void;
  [SocketEvents.TURN_CHANGE]: (payload: { playerId: string }) => void;
  [SocketEvents.PLAYER_ELIMINATED]: (payload: { playerId: string; reason: string }) => void;
  [SocketEvents.PLAYER_DISCONNECTED]: (payload: { playerId: string; playerName: string }) => void;
  [SocketEvents.PLAYER_RECONNECTED]: (payload: { playerId: string; playerName: string }) => void;
  [SocketEvents.GAME_PAUSED]: (payload: { pausedByPlayerName: string }) => void;
  [SocketEvents.GAME_RESUMED]: () => void;
  [SocketEvents.EXPANSION_VOTE_UPDATE]: (payload: {
    requestedBy: string;
    votes: Record<string, 'yes' | 'no'>;
  }) => void;
  [SocketEvents.TAKEOVER_DECLARED]: (payload: { attackerId: string; defenderId: string }) => void;
  [SocketEvents.TAKEOVER_RESOLVED]: (payload: {
    attackerId: string;
    defenderId: string;
    succeeded: boolean;
  }) => void;
  [SocketEvents.AUCTION_UPDATE]: (payload: { auction: AuctionState }) => void;
  [SocketEvents.GAME_FINISHED]: (payload: { winnerId: string; gameState: GameState }) => void;
  [SocketEvents.SYSTEM_ERROR]: (payload: { message: string }) => void;
  [SocketEvents.CHAT_MESSAGE]: (payload: {
    playerId: string;
    playerName: string;
    text: string;
    timestamp: number;
  }) => void;
}

export interface ClientToServerEvents {
  [SocketEvents.CREATE_ROOM]: (payload: { playerName: string }) => void;
  [SocketEvents.JOIN_ROOM]: (payload: { roomCode: string; playerName: string }) => void;
  [SocketEvents.LEAVE_ROOM]: () => void;
  [SocketEvents.SET_READY]: (payload: { isReady: boolean }) => void;
  [SocketEvents.SETTINGS_UPDATE]: (payload: { maxPlayers?: number; turnTimerSeconds?: number }) => void;
  [SocketEvents.START_GAME]: () => void;
  [SocketEvents.RECONNECT]: (payload: { roomCode: string; playerId: string; sessionToken?: string }) => void;
  [SocketEvents.GAME_ACTION]: (payload: { action: PlayerAction }) => void;
  [SocketEvents.AUCTION_PLACE_BID]: (payload: { auctionId: string; amount: number }) => void;
  [SocketEvents.AUCTION_CANCEL]: (payload: { auctionId: string }) => void;
  [SocketEvents.EXPANSION_REQUEST]: () => void;
  [SocketEvents.EXPANSION_VOTE]: (payload: { vote: 'yes' | 'no' }) => void;
  [SocketEvents.CHAT_SEND]: (payload: { text: string }) => void;
}
