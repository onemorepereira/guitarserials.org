import { describe, expect, it, test } from 'vitest';
import {
  findYearInRanges,
  PRS_BASS_BOLT_ON_RANGES,
  PRS_BASS_ELECTRIC_RANGES,
  PRS_BASS_SET_NECK_RANGES,
  PRS_CE_RANGES,
  PRS_EG_RANGES,
  PRS_S2_RANGES,
  PRS_SET_NECK_RANGES,
  PRS_SWAMP_ASH_RANGES,
} from '../src/patterns/prs.js';

// Mirrored from the reverb-scrapper sibling project (RS-22 commit
// 96e76d2). Pin every (start, end) boundary across the 8 PRS year-
// range tables. Off-by-one bugs at any boundary silently mis-date
// real serials by exactly one year; accidental overlaps return
// whichever year happens to appear first (depending on table order).
// Existing prsRanges.test.ts spot-checks year-band membership for
// representative serials; this file pins the boundaries themselves.

type PrsRange = [year: number, start: number, end: number];

const ALL_TABLES: ReadonlyArray<[string, PrsRange[]]> = [
  ['PRS_SET_NECK_RANGES', PRS_SET_NECK_RANGES],
  ['PRS_S2_RANGES', PRS_S2_RANGES],
  ['PRS_CE_RANGES', PRS_CE_RANGES],
  ['PRS_EG_RANGES', PRS_EG_RANGES],
  ['PRS_SWAMP_ASH_RANGES', PRS_SWAMP_ASH_RANGES],
  ['PRS_BASS_BOLT_ON_RANGES', PRS_BASS_BOLT_ON_RANGES],
  ['PRS_BASS_SET_NECK_RANGES', PRS_BASS_SET_NECK_RANGES],
  ['PRS_BASS_ELECTRIC_RANGES', PRS_BASS_ELECTRIC_RANGES],
];

describe.each(ALL_TABLES)('%s boundary coverage', (name, table) => {
  test('start of every range decodes to that year', () => {
    for (const [year, start] of table) {
      expect(findYearInRanges(start, table), `${name}: seq=${start} should decode to ${year}`).toBe(
        year,
      );
    }
  });

  test('end of every range decodes to that year', () => {
    for (const [year, , end] of table) {
      expect(findYearInRanges(end, table), `${name}: seq=${end} should decode to ${year}`).toBe(
        year,
      );
    }
  });

  test('one above the last range returns null', () => {
    const lastEnd = Math.max(...table.map(([, , e]) => e));
    expect(findYearInRanges(lastEnd + 1, table)).toBeNull();
  });

  test('one below the first range returns null (when start > 0)', () => {
    const firstStart = Math.min(...table.map(([, s]) => s));
    if (firstStart > 0) {
      expect(findYearInRanges(firstStart - 1, table)).toBeNull();
    }
  });

  test('no two ranges overlap', () => {
    for (let i = 0; i < table.length; i++) {
      for (let j = i + 1; j < table.length; j++) {
        const [yi, si, ei] = table[i] as PrsRange;
        const [yj, sj, ej] = table[j] as PrsRange;
        const overlap = !(ei < sj || ej < si);
        expect(overlap, `${name}: ${yi} (${si}-${ei}) and ${yj} (${sj}-${ej}) overlap`).toBe(false);
      }
    }
  });
});

describe('Documented gaps surface as null', () => {
  it('Set-Neck 2023→2024 gap (363799-375042) is undecodable', () => {
    expect(findYearInRanges(363799, PRS_SET_NECK_RANGES)).toBeNull();
    expect(findYearInRanges(375042, PRS_SET_NECK_RANGES)).toBeNull();
    expect(findYearInRanges(363798, PRS_SET_NECK_RANGES)).toBe(2023);
    expect(findYearInRanges(375043, PRS_SET_NECK_RANGES)).toBe(2024);
  });

  it('S2 2023→2024 gap (67489-71819) is undecodable', () => {
    expect(findYearInRanges(67489, PRS_S2_RANGES)).toBeNull();
    expect(findYearInRanges(71819, PRS_S2_RANGES)).toBeNull();
    expect(findYearInRanges(67488, PRS_S2_RANGES)).toBe(2023);
    expect(findYearInRanges(71820, PRS_S2_RANGES)).toBe(2024);
  });
});
