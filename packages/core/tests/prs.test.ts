import { describe, expect, it } from 'vitest';
import { matchSerial } from '../src/index.js';

describe('PRS serials', () => {
  it('S2 prefix', () => {
    const r = matchSerial('S2123456', 'PRS');
    expect(r!.brandFormat).toBe('prs_s2');
  });

  it('S2 prefix 7-digit', () => {
    const r = matchSerial('S21234567', 'PRS');
    expect(r!.brandFormat).toBe('prs_s2');
  });

  it('core 2008+', () => {
    const r = matchSerial('08123456', 'PRS');
    expect(r!.decodedYear).toBe(2008);
    expect(r!.brandFormat).toBe('prs_core');
  });

  it('core 2019', () => {
    const r = matchSerial('19123456', 'PRS');
    expect(r!.decodedYear).toBe(2019);
  });

  it('CE prefix', () => {
    const r = matchSerial('CE123456', 'PRS');
    expect(r!.brandFormat).toBe('prs_ce');
  });

  it('CTI prefix A = 2018', () => {
    const r = matchSerial('CTIA123456', 'PRS');
    expect(r!.decodedYear).toBe(2018);
    expect(r!.brandFormat).toBe('prs_cti');
  });

  it('CTI prefix B = 2019', () => {
    const r = matchSerial('CTIB12345', 'PRS');
    expect(r!.decodedYear).toBe(2019);
  });

  it('CTI prefix E = 2022', () => {
    const r = matchSerial('CTIE12345', 'PRS');
    expect(r!.decodedYear).toBe(2022);
  });
});

describe('PRS SE Korea (single-letter year)', () => {
  it('A = 2000', () => {
    const r = matchSerial('A12345', 'PRS');
    expect(r).not.toBeNull();
    expect(r!.decodedYear).toBe(2000);
    expect(r!.brandFormat).toBe('prs_se_korea');
  });

  it('B = 2001', () => {
    const r = matchSerial('B12345', 'PRS');
    expect(r!.decodedYear).toBe(2001);
    expect(r!.brandFormat).toBe('prs_se_korea');
  });

  it('T = 2019', () => {
    const r = matchSerial('T00123', 'PRS');
    expect(r!.decodedYear).toBe(2019);
    expect(r!.brandFormat).toBe('prs_se_korea');
  });

  it('U = 2020 (end of SE Korea letter chart)', () => {
    const r = matchSerial('U01234', 'PRS');
    expect(r!.decodedYear).toBe(2020);
    expect(r!.brandFormat).toBe('prs_se_korea');
  });

  it('V = 2021 (community-confirmed extension)', () => {
    const r = matchSerial('V12345', 'PRS');
    expect(r!.decodedYear).toBe(2021);
    expect(r!.brandFormat).toBe('prs_se_korea');
  });

  it('W = 2022', () => {
    const r = matchSerial('W12345', 'PRS');
    expect(r!.decodedYear).toBe(2022);
    expect(r!.brandFormat).toBe('prs_se_korea');
  });

  it('X and beyond not yet accepted (2023+ not publicly confirmed)', () => {
    expect(matchSerial('X12345', 'PRS')).toBeNull();
    expect(matchSerial('Z12345', 'PRS')).toBeNull();
  });

  it('short format (A + 3 digits) still matches SE Korea', () => {
    const r = matchSerial('A123', 'PRS');
    expect(r!.brandFormat).toBe('prs_se_korea');
    expect(r!.decodedYear).toBe(2000);
  });
});

describe('PRS acoustic (A + YY)', () => {
  it('A09 + seq = 2009 (first year of PRS acoustics)', () => {
    const r = matchSerial('A091234', 'PRS');
    expect(r!.decodedYear).toBe(2009);
    expect(r!.brandFormat).toBe('prs_acoustic');
  });

  it('A15 + 5-digit seq = 2015', () => {
    const r = matchSerial('A1500456', 'PRS');
    expect(r!.decodedYear).toBe(2015);
    expect(r!.brandFormat).toBe('prs_acoustic');
  });

  it('acoustic wins over SE Korea when YY is in 09-29 range', () => {
    // A125678 could be SE Korea 2000 or acoustic 2012. Acoustic wins.
    const r = matchSerial('A125678', 'PRS');
    expect(r!.brandFormat).toBe('prs_acoustic');
    expect(r!.decodedYear).toBe(2012);
  });

  it('A + YY with YY=00 (implausible acoustic year) falls through to SE Korea', () => {
    // A001234 as acoustic would be year 2000 (implausible, acoustics started 2009).
    // Should fall through to SE Korea.
    const r = matchSerial('A001234', 'PRS');
    expect(r!.brandFormat).toBe('prs_se_korea');
    expect(r!.decodedYear).toBe(2000);
  });
});

describe('PRS pre-2008 Core (single-digit year + cumulative range lookup)', () => {
  it('523000 = 1995 (seq 23000 falls in 1995 range 20901-24600)', () => {
    const r = matchSerial('523000', 'PRS');
    expect(r).not.toBeNull();
    expect(r!.brandFormat).toBe('prs_core_pre2008');
    expect(r!.decodedYear).toBe(1995);
  });

  it('629500 = 1996 (last seq in 1996 range)', () => {
    const r = matchSerial('629500', 'PRS');
    expect(r!.decodedYear).toBe(1996);
  });

  it('744499 = 1997 / no — 44499 is the 1999 end. Seq 44499 with Y=9 = 1999', () => {
    const r = matchSerial('944499', 'PRS');
    expect(r!.decodedYear).toBe(1999);
  });

  it('103103 with prefix 5 = 2005 (final 2005 serial)', () => {
    const r = matchSerial('5103103', 'PRS');
    expect(r!.decodedYear).toBe(2005);
  });

  it('Y=6 with sequential beyond 2005 range decodes to 2006', () => {
    // Past 103103, Y=6 pins to 2006
    const r = matchSerial('6110000', 'PRS');
    expect(r!.decodedYear).toBe(2006);
  });

  it('ambiguous Y+seq returns null year when no range matches', () => {
    // Y=3, seq=50000 — 50000 falls in 2000 range (44500-52199), but Y=3 != 0.
    // So no year matches; return null.
    const r = matchSerial('350000', 'PRS');
    expect(r!.brandFormat).toBe('prs_core_pre2008');
    expect(r!.decodedYear).toBeNull();
  });

  it('does not shadow the 2008+ Core rule', () => {
    // 08 prefix is 2008+ Core era, not pre-2008.
    const r = matchSerial('08123456', 'PRS');
    expect(r!.brandFormat).toBe('prs_core');
    expect(r!.decodedYear).toBe(2008);
  });

  it('7-digit 7-prefix still pre-2008 (7 could be 1987/1997/2007)', () => {
    // Y=7 not in 08/09/1X/2X range; pre-2008 rule catches it.
    const r = matchSerial('7345678', 'PRS');
    expect(r).not.toBeNull();
    expect(r!.brandFormat).toBe('prs_core_pre2008');
  });
});
