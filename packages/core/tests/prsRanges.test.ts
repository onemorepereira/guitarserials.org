import { describe, expect, it } from 'vitest';
import { matchSerial } from '../src/index.js';

/**
 * Spot-checks for the PRS year-range tables added in 0.3.0.
 * Data source: https://support.prsguitars.com/hc/en-us/articles/4408314427547-Year-Identification
 */

describe('PRS Set-Neck (Core) — full 1985–2024 coverage', () => {
  it('sequential 1 → 1985', () => {
    const r = matchSerial('50001', 'prs');
    expect(r!.brandFormat).toBe('prs_core_pre2008');
    expect(r!.decodedYear).toBe(1985);
  });

  it('sequential at 1995 boundary', () => {
    // 1995 range is 20901-24600. Y=5 matches, year ends in 5.
    const r = matchSerial('523000', 'prs');
    expect(r!.decodedYear).toBe(1995);
  });

  it('sequential 103104 with Y=6 → 2006 (first year after old table end)', () => {
    const r = matchSerial('6103500', 'prs');
    expect(r!.decodedYear).toBe(2006);
  });

  it('2008+ uses the two-digit YY prefix path (not range table)', () => {
    const r = matchSerial('08123456', 'prs');
    expect(r!.brandFormat).toBe('prs_core');
    expect(r!.decodedYear).toBe(2008);
  });

  it('2024 top of range → 2024', () => {
    // 2024 YY prefix path.
    const r = matchSerial('24397000', 'prs');
    expect(r!.decodedYear).toBe(2024);
  });
});

describe('PRS S2 — decoded via official range table', () => {
  it('S2000100 → 2013 (in 1-3820 range)', () => {
    const r = matchSerial('S2000100', 'prs');
    expect(r!.brandFormat).toBe('prs_s2');
    expect(r!.decodedYear).toBe(2013);
  });

  it('S2050000 → 2021 (49422-59387 range)', () => {
    const r = matchSerial('S2050000', 'prs');
    expect(r!.decodedYear).toBe(2021);
  });

  it('S2 sequential in published gap (67489-71819) → year null', () => {
    const r = matchSerial('S2070000', 'prs');
    expect(r!.brandFormat).toBe('prs_s2');
    expect(r!.decodedYear).toBeNull();
  });

  it('S2075000 → 2024 (71820-78569 range)', () => {
    const r = matchSerial('S2075000', 'prs');
    expect(r!.decodedYear).toBe(2024);
  });
});

describe('PRS CE — literal CE prefix, range-based decode', () => {
  it('CE20000 → 1999 (19581-20749 range)', () => {
    const r = matchSerial('CE20000', 'prs');
    expect(r!.brandFormat).toBe('prs_ce');
    expect(r!.decodedYear).toBe(1999);
  });

  it('CE33000 → 2008 (32784-33881 range)', () => {
    const r = matchSerial('CE33000', 'prs');
    expect(r!.decodedYear).toBe(2008);
  });

  it('CE out of range → year null but format still claimed', () => {
    const r = matchSerial('CE999999', 'prs');
    expect(r!.brandFormat).toBe('prs_ce');
    expect(r!.decodedYear).toBeNull();
  });
});

describe('PRS Swamp Ash Special — SA prefix', () => {
  it('SA500 → 1998 (411-760 range)', () => {
    const r = matchSerial('SA500', 'prs');
    expect(r!.brandFormat).toBe('prs_swamp_ash');
    expect(r!.decodedYear).toBe(1998);
  });

  it('SA3300 → 2009 (3257-3312 range)', () => {
    const r = matchSerial('SA3300', 'prs');
    expect(r!.decodedYear).toBe(2009);
  });
});

describe('PRS Electric Bass — EB prefix', () => {
  it('EB00100 → 2001 (73-199 range)', () => {
    const r = matchSerial('EB00100', 'prs');
    expect(r!.brandFormat).toBe('prs_bass_electric');
    expect(r!.decodedYear).toBe(2001);
  });

  it('EB00600 → 2004 (502-650 range)', () => {
    const r = matchSerial('EB00600', 'prs');
    expect(r!.decodedYear).toBe(2004);
  });
});

describe('PRS single-digit-prefix model lines — require model hint to disambiguate', () => {
  it('7-prefix 71000 without hint → Core rejected, falls to prs_core_pre2008 year=null', () => {
    // seq 1000 isn't in any year ending in 7 (1987 is 1701-3500, 1997 is 29501+).
    // Without a hint we don't try CE and the match stays null.
    const r = matchSerial('71000', 'prs');
    expect(r!.brandFormat).toBe('prs_core_pre2008');
    expect(r!.decodedYear).toBeNull();
  });

  it('7-prefix 71000 WITH CE hint → prs_ce decodes 1989', () => {
    const r = matchSerial('71000', 'prs', { modelHint: 'PRS CE 24' });
    expect(r!.brandFormat).toBe('prs_ce');
    expect(r!.decodedYear).toBe(1989); // seq 1000 in 271-1830 range
  });

  it('5-prefix 52000 WITH EG hint → prs_eg decodes 1992', () => {
    const r = matchSerial('52000', 'prs', { modelHint: 'PRS EG' });
    expect(r!.brandFormat).toBe('prs_eg');
    expect(r!.decodedYear).toBe(1992); // seq 2000 in 1291-2070 range
  });

  it('8-prefix 81000 WITH Swamp Ash hint → prs_swamp_ash decodes 2000', () => {
    const r = matchSerial('81000', 'prs', { modelHint: 'Swamp Ash Special' });
    expect(r!.brandFormat).toBe('prs_swamp_ash');
    expect(r!.decodedYear).toBe(2000); // seq 1000 in 970-1179 range
  });

  it('9-prefix 90500 WITH bass hint → prs_bass_set_neck decodes 1989', () => {
    const r = matchSerial('90500', 'prs', { modelHint: 'PRS bass' });
    expect(r!.brandFormat).toBe('prs_bass_set_neck');
    expect(r!.decodedYear).toBe(1989); // seq 500 in 351-680 range
  });
});
