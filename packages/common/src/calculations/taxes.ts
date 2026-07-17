import type { Player } from '../types/player';
import { ASSET_DEFINITIONS } from '../constants';

export function calculateTaxes(player: Player): number {
  if (player.isEliminated) return 0;

  let total = 0;

  for (const asset of player.assets) {
    const def = ASSET_DEFINITIONS[asset.type];
    total += def.taxPerRound;
  }

  return total;
}
