import type { Player } from './player';
import type { AssetMarket } from './asset';
import type { TakeoverState } from './takeover';
import type { AuctionState } from './auction';
import type { InvestmentOffer } from './contract';

export type GamePhase = 'lobby' | 'in_progress' | 'finished';

export type RoundPhase = 'actions' | 'taxes';

export interface ExpansionVotes {
  requestedBy: string;
  votes: Record<string, 'yes' | 'no'>;
  isResolved: boolean;
  passes: boolean;
}

export interface GameLogEntry {
  round: number;
  playerId: string | null;
  message: string;
  timestamp: number;
}

export interface GameState {
  id: string;
  phase: GamePhase;
  roundPhase: RoundPhase;
  roundNumber: number;
  players: Player[];
  market: AssetMarket;
  currentPlayerIndex: number;
  turnOrder: string[];
  turnTimerSeconds: number;
  turnTimerEndsAt: number | null;
  activeTakeover: TakeoverState | null;
  activeAuction: AuctionState | null;
  investmentOffers: InvestmentOffer[];
  expansionVotes: ExpansionVotes | null;
  expansionsUsed: number;
  winnerId: string | null;
  startedAt: number;
  logs: GameLogEntry[];
}
