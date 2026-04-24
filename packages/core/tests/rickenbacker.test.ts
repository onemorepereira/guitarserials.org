import { describe, expect, it } from 'vitest';
import { matchSerial } from '../src/index.js';

describe('Rickenbacker 1961-1986', () => {
  it('AA + digits = January 1961', () => {
    const r = matchSerial('AA1234', 'Rickenbacker');
    expect(r).not.toBeNull();
    expect(r!.decodedYear).toBe(1961);
    expect(r!.brandFormat).toBe('rickenbacker_1961_1986');
  });

  it('TL + digits = December 1980', () => {
    const r = matchSerial('TL567', 'Rickenbacker');
    expect(r!.decodedYear).toBe(1980);
    expect(r!.brandFormat).toBe('rickenbacker_1961_1986');
  });

  it('ZA + digits = January 1986 (last year of this era)', () => {
    const r = matchSerial('ZA00001', 'Rickenbacker');
    expect(r!.decodedYear).toBe(1986);
  });

  it('BG + digits = July 1962', () => {
    const r = matchSerial('BG1234', 'Rickenbacker');
    expect(r!.decodedYear).toBe(1962);
  });

  it('AM (month letter beyond L) does not match 1961-1986', () => {
    // M is not a valid month letter in this era (only A-L)
    // Falls through — no other rule matches A + M + digits
    expect(matchSerial('AM1234', 'Rickenbacker')).toBeNull();
  });
});

describe('Rickenbacker 1987-1996', () => {
  it('A0001 = January 1987', () => {
    const r = matchSerial('A0001', 'Rickenbacker');
    expect(r).not.toBeNull();
    expect(r!.decodedYear).toBe(1987);
    expect(r!.brandFormat).toBe('rickenbacker_1987_1996');
  });

  it('L9001 = December 1996 (last year of this era)', () => {
    const r = matchSerial('L9001', 'Rickenbacker');
    expect(r!.decodedYear).toBe(1996);
    expect(r!.brandFormat).toBe('rickenbacker_1987_1996');
  });

  it('F5123 = June 1992', () => {
    const r = matchSerial('F5123', 'Rickenbacker');
    expect(r!.decodedYear).toBe(1992);
  });
});

describe('Rickenbacker 1996+', () => {
  it('M0123 without listing year leaves decade-ambiguous (null year)', () => {
    const r = matchSerial('M0123', 'Rickenbacker');
    expect(r).not.toBeNull();
    expect(r!.brandFormat).toBe('rickenbacker_1996_plus');
    expect(r!.decodedYear).toBeNull();
  });

  it('M0123 with listing 2000 snaps to first cycle (1997)', () => {
    const r = matchSerial('M0123', 'Rickenbacker', { listingYear: 2000 });
    expect(r!.decodedYear).toBe(1997);
  });

  it('M0123 with listing 2008 snaps to second cycle (2007)', () => {
    const r = matchSerial('M0123', 'Rickenbacker', { listingYear: 2008 });
    expect(r!.decodedYear).toBe(2007);
  });

  it('M0123 with listing 2020 snaps to third cycle (2017)', () => {
    const r = matchSerial('M0123', 'Rickenbacker', { listingYear: 2020 });
    expect(r!.decodedYear).toBe(2017);
  });

  it('letter O is skipped (not accepted as month)', () => {
    expect(matchSerial('O0123', 'Rickenbacker')).toBeNull();
  });
});
