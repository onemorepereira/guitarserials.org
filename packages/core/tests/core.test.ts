import { describe, expect, it } from 'vitest';
import { tierRank } from '../src/tierRank.js';
import type { SerialMatch, SerialMatchCandidate } from '../src/types.js';

function makeTestMatch(
  serial: string,
  decodedYear: number | null,
  confidenceTier: SerialMatch['confidenceTier'],
  brandFormat: string,
): SerialMatch {
  const cand: SerialMatchCandidate = { serial, decodedYear, brandFormat };
  return {
    serial,
    candidates: [cand],
    best: cand,
    confidenceTier,
    decodedYear,
    brandFormat,
    confidenceTierRank: tierRank(confidenceTier),
  };
}

describe('SerialMatch dataclass', () => {
  it('confidence_tier_rank high', () => {
    const m = makeTestMatch('12345678', 2015, 'high', 'gibson_yddd_yrrr');
    expect(m.confidenceTierRank).toBe(3);
  });

  it('confidence_tier_rank medium', () => {
    const m = makeTestMatch('12345678', null, 'medium', 'gibson_yddd_yrrr');
    expect(m.confidenceTierRank).toBe(2);
  });

  it('confidence_tier_rank low', () => {
    const m = makeTestMatch('12345678', 2015, 'low', 'gibson_yddd_yrrr');
    expect(m.confidenceTierRank).toBe(1);
  });

  it('confidence_tier_rank unknown tier defaults to 0', () => {
    expect(tierRank('unknown')).toBe(0);
  });

  it('backward-compat decodedYear/brandFormat delegate to best', () => {
    const m = makeTestMatch('12345678', 1985, 'high', 'gibson_yddd_yrrr');
    expect(m.decodedYear).toBe(1985);
    expect(m.brandFormat).toBe('gibson_yddd_yrrr');
  });
});
