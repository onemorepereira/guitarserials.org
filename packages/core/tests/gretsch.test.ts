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

  it('out-of-era 5-digit falls through to pre-1966 sequential (year null)', () => {
    // 35123: year-digit=5 is outside the 1966-1972 date-coded window (0-2/6-9),
    // so the date-coded rule doesn't fire. The pre-1966 sequential fallback
    // catches it as a format match with no decoded year.
    const r = matchSerial('35123', 'Gretsch');
    expect(r).not.toBeNull();
    expect(r!.brandFormat).toBe('gretsch_pre1966_sequential');
    expect(r!.decodedYear).toBeNull();
  });
});

describe('Gretsch pre-1966 sequential', () => {
  it('3-digit serial matches (handwritten 1939-1945 era)', () => {
    const r = matchSerial('342', 'Gretsch');
    expect(r!.brandFormat).toBe('gretsch_pre1966_sequential');
    expect(r!.decodedYear).toBeNull();
  });

  it('4-digit serial matches (1945-1954 era)', () => {
    const r = matchSerial('5000', 'Gretsch');
    expect(r!.brandFormat).toBe('gretsch_pre1966_sequential');
  });

  it('5-digit serial in pre-1966 era falls through when date-coded is invalid', () => {
    // 55000: M=5, Y=5 — year-digit 5 is outside the date-coded 0-2/6-9 window,
    // so date-coded rejects and pre-1966 sequential catches it.
    const r = matchSerial('55000', 'Gretsch');
    expect(r!.brandFormat).toBe('gretsch_pre1966_sequential');
  });
});
