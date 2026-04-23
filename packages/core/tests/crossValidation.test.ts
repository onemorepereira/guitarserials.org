import { describe, expect, it } from 'vitest';
import { matchSerial } from '../src/index.js';

describe('Cross-validation (year tier)', () => {
  it('year match high confidence', () => {
    const r = matchSerial('82765501', 'Gibson', { listingYear: 1985 });
    expect(r!.confidenceTier).toBe('high');
  });

  it('year within 1 stays high', () => {
    const r = matchSerial('82765501', 'Gibson', { listingYear: 1986 });
    expect(r!.confidenceTier).toBe('high');
  });

  it('year gap 2 demotes to review', () => {
    const r = matchSerial('82765501', 'Gibson', { listingYear: 1987 });
    expect(r!.confidenceTier).toBe('review');
  });

  it('year mismatch large gap rejected', () => {
    const r = matchSerial('82765501', 'Gibson', { listingYear: 2010 });
    expect(r!.confidenceTier).toBe('rejected');
  });

  it('no listing year trusts decode (high)', () => {
    const r = matchSerial('82765501', 'Gibson');
    expect(r!.confidenceTier).toBe('high');
  });

  it('prefix match stays high regardless of year', () => {
    const r = matchSerial('CS12345', 'Gibson Custom Shop', { listingYear: 2020 });
    expect(r!.confidenceTier).toBe('high');
  });
});

describe('Three-tier year mismatch', () => {
  it('gap 0 → high', () => {
    expect(matchSerial('82765501', 'Gibson', { listingYear: 1985 })!.confidenceTier).toBe('high');
  });
  it('gap 1 → high', () => {
    expect(matchSerial('82765501', 'Gibson', { listingYear: 1984 })!.confidenceTier).toBe('high');
  });
  it('gap 3 → review', () => {
    expect(matchSerial('82765501', 'Gibson', { listingYear: 1988 })!.confidenceTier).toBe('review');
  });
  it('gap 5 → review', () => {
    expect(matchSerial('82765501', 'Gibson', { listingYear: 1990 })!.confidenceTier).toBe('review');
  });
  it('gap 6 → rejected', () => {
    expect(matchSerial('82765501', 'Gibson', { listingYear: 1991 })!.confidenceTier).toBe(
      'rejected',
    );
  });
  it('gap 10 → rejected', () => {
    expect(matchSerial('82765501', 'Gibson', { listingYear: 1995 })!.confidenceTier).toBe(
      'rejected',
    );
  });

  it('missing listing year trusts decoded', () => {
    expect(matchSerial('82765501', 'Gibson')!.confidenceTier).toBe('high');
  });

  it('override beats gap', () => {
    const r = matchSerial('JP1234', 'Gibson Custom Shop', { listingYear: 1980 });
    expect(r).not.toBeNull();
    expect(r!.decodedYear).toBeNull();
    expect(r!.confidenceTier).toBe('high');
  });
});
