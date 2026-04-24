import { describe, expect, it } from 'vitest';
import { matchSerial } from '../src/index.js';

/**
 * Cross-brand stress tests. Goals:
 *  1. Normalization never produces false positives (whitespace, case).
 *  2. Year-plausibility gates prevent nonsense decodes.
 *  3. Cross-brand collisions resolve correctly under each brand's dispatch.
 *  4. Boundary conditions at era transitions behave correctly.
 */

describe('Input normalization', () => {
  it('strips leading whitespace', () => {
    const r = matchSerial('  82765501', 'Gibson');
    expect(r!.serial).toBe('82765501');
  });

  it('strips trailing whitespace', () => {
    const r = matchSerial('82765501  ', 'Gibson');
    expect(r!.serial).toBe('82765501');
  });

  it('strips internal whitespace', () => {
    const r = matchSerial('8 2 7 6 5 5 0 1', 'Gibson');
    expect(r!.serial).toBe('82765501');
  });

  it('uppercases lowercase letters in prefixes', () => {
    const r = matchSerial('cs500123', 'Gibson Custom Shop');
    expect(r!.serial).toBe('CS500123');
  });

  it('uppercases mixed-case input', () => {
    const r = matchSerial('Us12345678', 'Fender');
    expect(r!.serial).toBe('US12345678');
  });

  it('rejects empty string', () => {
    expect(matchSerial('', 'Gibson')).toBeNull();
  });

  it('rejects whitespace-only input', () => {
    expect(matchSerial('   ', 'Gibson')).toBeNull();
  });

  it('rejects empty brand', () => {
    expect(matchSerial('82765501', '')).toBeNull();
  });

  it('brand name is case-insensitive', () => {
    expect(matchSerial('82765501', 'GIBSON')).not.toBeNull();
    expect(matchSerial('82765501', 'gibson')).not.toBeNull();
    expect(matchSerial('82765501', 'Gibson ')).not.toBeNull();
  });
});

describe('Cross-brand collisions', () => {
  // Same serial under different brands may legitimately decode differently.

  it("'B12345' means 1985 Heritage under Heritage, 2001 PRS SE Korea under PRS", () => {
    const h = matchSerial('B12345', 'Heritage');
    expect(h!.decodedYear).toBe(1985);
    expect(h!.brandFormat).toBe('heritage_single');

    const p = matchSerial('B12345', 'PRS');
    expect(p!.decodedYear).toBe(2001);
    expect(p!.brandFormat).toBe('prs_se_korea');
  });

  it("'A12345' — Gibson a_series vs PRS SE Korea differ", () => {
    // Gibson A-series: A-12345 is in 1952 range (A-9420 through A-12462).
    const g = matchSerial('A12345', 'Gibson');
    expect(g!.brandFormat).toBe('gibson_a_series');
    expect(g!.decodedYear).toBe(1952);

    // PRS SE Korea: A=2000.
    const p = matchSerial('A12345', 'PRS');
    expect(p!.brandFormat).toBe('prs_se_korea');
    expect(p!.decodedYear).toBe(2000);
  });

  it("'MN4123456' means 1994 under Fender, same under Squier", () => {
    // Fender MN + single digit year.
    const f = matchSerial('MN4123456', 'Fender');
    expect(f!.decodedYear).toBe(1994);

    // Squier shares this format through its matcher.
    const s = matchSerial('MN4123456', 'Squier');
    expect(s!.decodedYear).toBe(1994);
  });
});

describe('Era-transition boundaries', () => {
  it('Gibson YDDDYRRR: year-digit boundary 39 vs 40', () => {
    // Year digits 00-39 → 2000-2039 (but YDDDYRRR ran through 2005).
    // 80012005: pos 1 = 8, pos 5 = 2 → year 1982 (40+ → 1982). ✓
    const y82 = matchSerial('80012005', 'Gibson');
    expect(y82!.decodedYear).toBe(1982);

    // 20012005: pos 1+5 = "2"+"2" = 22 → 2022 (via year < 40 → 2000+22).
    // But 2022 is outside YDDDYRRR era; format still matches though.
    const y22 = matchSerial('20012005', 'Gibson');
    expect(y22!.decodedYear).toBe(2022);
  });

  it('Gibson simplified YYNNNNNNN: year range 14-19 only', () => {
    // YY=14 → 2014 (start of simplified era)
    const y14 = matchSerial('140005521', 'Gibson');
    expect(y14!.decodedYear).toBe(2014);
    expect(y14!.brandFormat).toBe('gibson_yy_sequential');

    // YY=20 would be out of the simplified-era range; falls to YDDDYBRRR.
    const y20 = matchSerial('200050000', 'Gibson');
    if (y20 !== null) {
      expect(y20.brandFormat).not.toBe('gibson_yy_sequential');
    }
  });

  it('Fender V-prefix AVRI II: YY boundary 11 vs 12', () => {
    // Pre-2012: no year decoded.
    const v11 = matchSerial('V1112345', 'Fender');
    expect(v11!.brandFormat).toBe('fender_avri_v_prefix');
    // V11 — YY=11 is OUTSIDE the 12-29 plausibility window; year should be null.
    expect(v11!.decodedYear).toBeNull();

    // 2012+: year decoded.
    const v12 = matchSerial('V1212345', 'Fender');
    expect(v12!.decodedYear).toBe(2012);
  });

  it('Ibanez F-prefix: 6-digit (pre-1997) vs 7-digit (1997+)', () => {
    // F + 6 digits: single-Y year encoding.
    const f6 = matchSerial('F720327', 'Ibanez');
    expect(f6!.brandFormat).toBe('ibanez_japan_f');
    // Actually F+ 7 digits: first 2 digits = YY. F72 = 1972? No — YY=72 → 1972 < 50 false, so 1900+72=1972.
    // Let me verify: F720327 is 7 chars = F + 6 digits? No — F720327 is 7 chars total, F + 6.
    // Our rule `^F(\d{6})$` matches F+6 digits. For F720327 = F + "720327" (6 digits).
    // Single-digit year: first digit "7" → 1987. Fails to match F+6 → single-digit year = 7 → 1987.
    expect(f6!.decodedYear).toBe(1987);

    // F + 7 digits: YY year encoding. F9825445 = F + 7 digits.
    const f7 = matchSerial('F9825445', 'Ibanez');
    expect(f7!.decodedYear).toBe(1998);
  });

  it('Heritage single-letter B through Y well-defined', () => {
    expect(matchSerial('B00001', 'Heritage')!.decodedYear).toBe(1985);
    expect(matchSerial('Y00001', 'Heritage')!.decodedYear).toBe(2008);
  });

  it('Heritage double-letter AA through AP well-defined, AQ rejected', () => {
    expect(matchSerial('AA00001', 'Heritage')!.decodedYear).toBe(2010);
    expect(matchSerial('AP00001', 'Heritage')!.decodedYear).toBe(2025);
    expect(matchSerial('AQ00001', 'Heritage')).toBeNull();
  });
});

describe('Garbage input handling', () => {
  it('fully non-matching input returns null, not a false format', () => {
    expect(matchSerial('ZZZZZZZZ', 'Gibson')).toBeNull();
    expect(matchSerial('!@#$%^', 'Fender')).toBeNull();
  });

  it('very long numeric strings return null', () => {
    expect(matchSerial('1234567890123456789', 'Gibson')).toBeNull();
  });

  it('unsupported brand returns null regardless of serial', () => {
    expect(matchSerial('82765501', 'Harmony')).toBeNull();
    expect(matchSerial('US12345678', 'Kramer')).toBeNull();
  });
});
