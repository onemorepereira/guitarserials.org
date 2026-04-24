import { describe, expect, it } from 'vitest';
import { matchSerial } from '../src/index.js';

/**
 * Covers the decodedMonth / decodedDay fields added in 0.2.0.
 *
 * Each assertion targets one of the three precision tiers:
 *   - full date (month + day)  — Gibson YDDDY, ESP pre-2000 Japan
 *   - month only               — Gretsch, G&L CLF-dated, Ibanez YYMM, Epiphone, Rickenbacker
 *   - no date                  — year-only formats (Fender decade prefix, Martin, etc.)
 */

describe('date precision — full date (month + day)', () => {
  it('Gibson YDDDYRRR 82765501 = October 3, 1985', () => {
    const r = matchSerial('82765501', 'gibson');
    expect(r!.decodedYear).toBe(1985);
    expect(r!.decodedMonth).toBe(10);
    expect(r!.decodedDay).toBe(3);
  });

  it('Gibson YDDDYBRRR 208050358 = March 21, 2025', () => {
    // Day-of-year 080 in 2025 (non-leap) = March 21.
    const r = matchSerial('208050358', 'gibson');
    expect(r!.decodedYear).toBe(2025);
    expect(r!.decodedMonth).toBe(3);
    expect(r!.decodedDay).toBe(21);
  });

  it('Gibson YDDDY leap-year DOY 060 = February 29, 2024', () => {
    // 206040123 — Y=pos1+pos5 = "2"+"4" = 24 → 2024 (leap).
    // DDD = pos 2-4 = "060" → Feb 29 in a leap year.
    const r = matchSerial('206040123', 'gibson');
    expect(r!.decodedYear).toBe(2024);
    expect(r!.decodedMonth).toBe(2);
    expect(r!.decodedDay).toBe(29);
  });

  it('ESP pre-2000 Japan 25055012 = May 25, 1995 (with listing year)', () => {
    const r = matchSerial('25055012', 'esp', { listingYear: 1995 });
    expect(r!.decodedYear).toBe(1995);
    expect(r!.decodedMonth).toBe(5);
    expect(r!.decodedDay).toBe(25);
  });
});

describe('date precision — month only', () => {
  it('Gretsch modern JT07115922 = November 2007', () => {
    const r = matchSerial('JT07115922', 'gretsch');
    expect(r!.decodedYear).toBe(2007);
    expect(r!.decodedMonth).toBe(11);
    expect(r!.decodedDay).toBeNull();
  });

  it('G&L CLF dated CLF0304012 = April 2003', () => {
    const r = matchSerial('CLF0304012', 'g&l');
    expect(r!.decodedYear).toBe(2003);
    expect(r!.decodedMonth).toBe(4);
    expect(r!.decodedDay).toBeNull();
  });

  it('Ibanez Indonesia I160600221 = June 2016', () => {
    const r = matchSerial('I160600221', 'ibanez');
    expect(r!.decodedYear).toBe(2016);
    expect(r!.decodedMonth).toBe(6);
  });

  it('Ibanez Korea S (Samick) S4110076 = November 1994', () => {
    const r = matchSerial('S4110076', 'ibanez');
    expect(r!.decodedYear).toBe(1994);
    expect(r!.decodedMonth).toBe(11);
  });

  it('Ibanez pre-F letter-month A790665 = January 1979', () => {
    const r = matchSerial('A790665', 'ibanez');
    expect(r!.decodedYear).toBe(1979);
    expect(r!.decodedMonth).toBe(1);
  });

  it('Ibanez W-prefix World Korea W02Y12345 = November 2002', () => {
    const r = matchSerial('W02Y12345', 'ibanez');
    expect(r!.decodedYear).toBe(2002);
    expect(r!.decodedMonth).toBe(11);
  });

  it('Epiphone numeric 1503123456 = March 2015', () => {
    const r = matchSerial('1503123456', 'epiphone');
    expect(r!.decodedYear).toBe(2015);
    expect(r!.decodedMonth).toBe(3);
  });

  it('Rickenbacker 1987–1996 A0001 = January 1987', () => {
    const r = matchSerial('A0001', 'rickenbacker');
    expect(r!.decodedYear).toBe(1987);
    expect(r!.decodedMonth).toBe(1);
  });

  it('Rickenbacker 1960 JK123 = November 1960', () => {
    const r = matchSerial('JK123', 'rickenbacker');
    expect(r!.decodedYear).toBe(1960);
    expect(r!.decodedMonth).toBe(11);
  });

  it('Rickenbacker 1961–1986 AB1234 = February 1961', () => {
    const r = matchSerial('AB1234', 'rickenbacker');
    expect(r!.decodedYear).toBe(1961);
    expect(r!.decodedMonth).toBe(2);
  });

  it('Rickenbacker 1996+ M0001 with listingYear = January 1997', () => {
    const r = matchSerial('M0001', 'rickenbacker', { listingYear: 1997 });
    expect(r!.decodedYear).toBe(1997);
    expect(r!.decodedMonth).toBe(1);
  });
});

describe('date precision — year only (nothing emitted)', () => {
  it('Fender decade-prefix N8357086 → year 1998, no month/day', () => {
    const r = matchSerial('N8357086', 'fender');
    expect(r!.decodedYear).toBe(1998);
    expect(r!.decodedMonth ?? null).toBeNull();
    expect(r!.decodedDay ?? null).toBeNull();
  });

  it('Martin sequential 500000 → year decoded, no month/day', () => {
    const r = matchSerial('500000', 'martin');
    expect(r!.decodedYear).toBeTruthy();
    expect(r!.decodedMonth ?? null).toBeNull();
    expect(r!.decodedDay ?? null).toBeNull();
  });
});
