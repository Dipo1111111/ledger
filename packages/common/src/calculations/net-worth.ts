import type { Player } from '../types/player';
import { ASSET_DEFINITIONS } from '../constants';

export function calculateNetWorth(player: Player): number {
  if (player.isEliminated) return 0;

  let assetValue = 0;

  for (const asset of player.assets) {
    const def = ASSET_DEFINITIONS[asset.type];
    assetValue += def.purchasePrice;
  }

  return player.lc + assetValue;
}
