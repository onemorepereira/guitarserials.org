import { describe, expect, it } from 'vitest';
import { matchSerial } from '../src/index.js';

describe('Jackson modern import', () => {
  it('ICJ1500001 = Indonesia Cort 2015', () => {
    const r = matchSerial('ICJ1500001', 'Jackson');
    expect(r).not.toBeNull();
    expect(r!.decodedYear).toBe(2015);
    expect(r!.brandFormat).toBe('jackson_modern_import');
    expect(r!.confidenceTier).toBe('high');
  });

  it('CYJ2201234 = China Yako 2022', () => {
    const r = matchSerial('CYJ2201234', 'Jackson');
    expect(r!.decodedYear).toBe(2022);
  });

  it('NHJ2001234 = India Chushin Gakki 2020', () => {
    const r = matchSerial('NHJ2001234', 'Jackson');
    expect(r!.decodedYear).toBe(2020);
    expect(r!.brandFormat).toBe('jackson_modern_import');
  });

  it('IWJ1901234 = Indonesia World 2019', () => {
    const r = matchSerial('IWJ1901234', 'Jackson');
    expect(r!.decodedYear).toBe(2019);
  });

  it('unknown 3-letter prefix rejected', () => {
    expect(matchSerial('XXX2201234', 'Jackson')).toBeNull();
  });
});

describe('Jackson USA', () => {
  it('Randy Rhoads RR0001 matches signature format', () => {
    const r = matchSerial('RR0001', 'Jackson');
    expect(r!.brandFormat).toBe('jackson_rr_signature');
    expect(r!.decodedYear).toBeNull();
  });

  it('J1234 matches USA J-prefix', () => {
    const r = matchSerial('J1234', 'Jackson');
    expect(r!.brandFormat).toBe('jackson_usa');
    expect(r!.decodedYear).toBeNull();
  });
});

describe('Jackson MIJ Professional (1990-1995)', () => {
  it('412345 = 1994 #12345', () => {
    const r = matchSerial('412345', 'Jackson');
    expect(r!.decodedYear).toBe(1994);
    expect(r!.brandFormat).toBe('jackson_mij_professional');
  });

  it('012345 = 1990', () => {
    const r = matchSerial('012345', 'Jackson');
    expect(r!.decodedYear).toBe(1990);
  });

  it('512345 = 1995 (last year of this format)', () => {
    const r = matchSerial('512345', 'Jackson');
    expect(r!.decodedYear).toBe(1995);
  });

  it('first digit > 5 rejected (outside MIJ Professional window)', () => {
    expect(matchSerial('612345', 'Jackson')).toBeNull();
    expect(matchSerial('912345', 'Jackson')).toBeNull();
  });
});
