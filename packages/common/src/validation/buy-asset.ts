import type { AssetType } from '../types/asset';
import type { GameState } from '../types/game-state';
import { ASSET_DEFINITIONS } from '../constants';
import type { ValidationResult } from './validation-result';

export function canBuyAsset(
  playerId: string,
  assetType: AssetType,
  state: GameState,
): ValidationResult {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return { valid: false, reason: 'Player not found' };

  const def = ASSET_DEFINITIONS[assetType];
  if (!def) return { valid: false, reason: 'Unknown asset type' };

  if (state.market[assetType] <= 0) {
    return { valid: false, reason: 'No supply left in market' };
  }

  const owned = player.assets.filter((a) => a.type === assetType).length;
  if (owned >= def.maxPerPlayer) {
    return {
      valid: false,
      reason: `Already at max ${assetType}s (${def.maxPerPlayer})`,
    };
  }

  if (player.lc < def.purchasePrice) {
    return {
      valid: false,
      reason: `Need ${def.purchasePrice} LC, have ${player.lc} LC`,
    };
  }

  return { valid: true };
}
