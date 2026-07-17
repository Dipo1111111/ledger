export type TakeoverPhase = 'declared' | 'defense' | 'succeeded' | 'failed';

export interface TakeoverState {
  attackerId: string;
  defenderId: string;
  phase: TakeoverPhase;
  requiredReserve: number;
  currentProgress: number;
  defenseDeadlineRound: number;
  resolutionRound: number | null;
}
