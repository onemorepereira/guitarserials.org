import type { ConfidenceTier } from './types.js';

export const TIER_RANK: Record<ConfidenceTier | string, number> = {
  review: 0,
  low: 1,
  medium: 2,
  high: 3,
  hybrid: 3,
  verified: 4,
  rejected: -1,
};

export function tierRank(tier: string): number {
  return TIER_RANK[tier] ?? 0;
}
