import { describe, expect, it } from 'vitest';
import { matchSerial } from '../src/index.js';

describe('Gretsch modern (2003+)', () => {
  it('JT07115922 = Japan Terada November 2007', () => {
    const r = matchSerial('JT07115922', 'Gretsch');
    expect(r).not.toBeNull();
    expect(r!.decodedYear).toBe(2007);
    expect(r!.brandFormat).toBe('gretsch_modern');
    expect(r!.confidenceTier).toBe('high');
  });

  it('CS15030001 = USA Custom Shop March 2015', () => {
    const r = matchSerial('CS15030001', 'Gretsch');
    expect(r!.decodedYear).toBe(2015);
    expect(r!.brandFormat).toBe('gretsch_modern');
  });

  it('KS20060042 = Korea Samick June 2020', () => {
    const r = matchSerial('KS20060042', 'Gretsch');
    expect(r!.decodedYear).toBe(2020);
  });

  it('invalid factory code rejected', () => {
    expect(matchSerial('ZZ07115922', 'Gretsch')).toBeNull();
  });

  it('invalid month (13) rejected', () => {
    expect(matchSerial('JT07130001', 'Gretsch')).toBeNull();
  });
});

describe('Gretsch 1966-1972 date-coded', () => {
  it('118145 = November 1968 #145', () => {
    const r = matchSerial('118145', 'Gretsch', { listingYear: 1968 });
    expect(r).not.toBeNull();
    expect(r!.decodedYear).toBe(1968);
    expect(r!.brandFormat).toBe('gretsch_date_coded_1966_1972');
  });

  it('36123 = March 1966 #123 (with listing year)', () => {
    const r = matchSerial('36123', 'Gretsch', { listingYear: 1966 });
    expect(r).not.toBeNull();
    expect(r!.decodedYear).toBe(1966);
  });

  it('rejects out-of-era date-coded without listing year', () => {
    // 35xxxx with no context: month=3, year-digit=5 — year 5 would decode to 1975
    // but 1975 is outside the 1966-1972 window. Without listing year we still
    // require the year digit to be in 0-2 or 6-9.
    const r = matchSerial('35123', 'Gretsch');
    // 3 (month) + 5 (year digit 5 is outside our valid set) → no match
    expect(r).toBeNull();
  });
});
