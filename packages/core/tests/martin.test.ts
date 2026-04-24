import { describe, expect, it } from 'vitest';
import { matchSerial } from '../src/index.js';

describe('Martin', () => {
  it('1950 serial (117961) = 1950 exactly', () => {
    const r = matchSerial('117961', 'Martin');
    expect(r).not.toBeNull();
    expect(r!.decodedYear).toBe(1950);
    expect(r!.brandFormat).toBe('martin_sequential');
  });

  it('800000 (past 2001 end) decodes to 2002', () => {
    // 2001 end = 845644, 2002 end = 916759 — 800000 falls in the 2001 range.
    // Wait — 800000 > 780500 (2000 end), < 845644 (2001 end) → year 2001.
    const r = matchSerial('800000', 'Martin');
    expect(r!.decodedYear).toBe(2001);
  });

  it('1000000 decodes to 2004 (between 2003 end = 978706 and 2004 end = 1042558)', () => {
    const r = matchSerial('1000000', 'Martin');
    expect(r!.decodedYear).toBe(2004);
  });

  it('1920-era serial decodes to 1920', () => {
    // 1920 end = 15848, 1921 end = 16758. 15000 → 1920.
    const r = matchSerial('15000', 'Martin');
    expect(r!.decodedYear).toBe(1920);
  });

  it('1991 mandolin-merged serial still decodes correctly', () => {
    // 1991 end = 512487. Use 510000.
    const r = matchSerial('510000', 'Martin');
    expect(r!.decodedYear).toBe(1991);
  });

  it('Sigma-Martin range (900001-902908) is rejected', () => {
    expect(matchSerial('900500', 'Martin')).toBeNull();
    expect(matchSerial('902000', 'Martin')).toBeNull();
  });

  it('below earliest documented returns null year (still matches format)', () => {
    // Below 1898 starting serial 8348
    const r = matchSerial('5000', 'Martin');
    expect(r).not.toBeNull();
    expect(r!.decodedYear).toBeNull();
    expect(r!.brandFormat).toBe('martin_sequential');
  });
});
