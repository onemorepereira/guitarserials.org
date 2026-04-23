import { describe, expect, it } from 'vitest';
import { matchSerial } from '../src/index.js';

describe('Gibson serials', () => {
  it('8-digit valid year decode', () => {
    const r = matchSerial('82765501', 'Gibson');
    expect(r).not.toBeNull();
    expect(r!.serial).toBe('82765501');
    expect(r!.decodedYear).toBe(1985);
    expect(r!.brandFormat).toBe('gibson_yddd_yrrr');
    expect(r!.confidenceTier).toBe('high');
  });

  it('8-digit 2010s year', () => {
    const r = matchSerial('11523456', 'Gibson');
    expect(r).not.toBeNull();
    expect(r!.decodedYear).toBe(2013);
    expect(r!.brandFormat).toBe('gibson_yddd_yrrr');
  });

  it('8-digit year 2000s', () => {
    const r = matchSerial('00100789', 'Gibson');
    expect(r).not.toBeNull();
    expect(r!.decodedYear).toBe(2000);
  });

  it('9-digit valid', () => {
    const r = matchSerial('821654501', 'Gibson');
    expect(r).not.toBeNull();
    expect(r!.brandFormat).toBe('gibson_yddd_ybrrr');
    expect(r!.decodedYear).toBe(1985);
  });

  it('9-digit simplified 2014-2019', () => {
    const r = matchSerial('150000123', 'Gibson');
    expect(r).not.toBeNull();
    expect(r!.decodedYear).toBe(2015);
    expect(r!.brandFormat).toBe('gibson_yy_sequential');
  });

  it('9-digit simplified 2019', () => {
    const r = matchSerial('190012345', 'Gibson');
    expect(r).not.toBeNull();
    expect(r!.decodedYear).toBe(2019);
    expect(r!.brandFormat).toBe('gibson_yy_sequential');
  });

  it('invalid day of year rejected', () => {
    const r = matchSerial('84000123', 'Gibson');
    expect(r).toBeNull();
  });

  it('day 000 rejected', () => {
    const r = matchSerial('80001234', 'Gibson');
    expect(r).toBeNull();
  });

  it('day 366 accepted', () => {
    const r = matchSerial('83661234', 'Gibson');
    expect(r).not.toBeNull();
    expect(r!.decodedYear).toBe(1981);
  });

  it('whitespace normalization', () => {
    const r = matchSerial('  82765501  ', 'Gibson');
    expect(r).not.toBeNull();
    expect(r!.serial).toBe('82765501');
  });

  it('3-digit too short rejected', () => {
    expect(matchSerial('123', 'Gibson')).toBeNull();
  });

  it('too long rejected', () => {
    expect(matchSerial('1234567890', 'Gibson')).toBeNull();
  });

  it('non-numeric rejected', () => {
    expect(matchSerial('8276550A', 'Gibson')).toBeNull();
  });

  it('pre-1977 4-digit', () => {
    const r = matchSerial('6370', 'Gibson');
    expect(r).not.toBeNull();
    expect(r!.serial).toBe('6370');
    expect(r!.brandFormat).toBe('gibson_pre1977');
    expect(r!.decodedYear).toBeNull();
  });

  it('pre-1977 5-digit', () => {
    const r = matchSerial('88177', 'Gibson');
    expect(r).not.toBeNull();
    expect(r!.brandFormat).toBe('gibson_pre1977');
  });

  it('pre-1977 7-digit', () => {
    const r = matchSerial('1234567', 'Gibson');
    expect(r).not.toBeNull();
    expect(r!.brandFormat).toBe('gibson_pre1977');
  });
});

describe('Gibson 9-digit dual decode', () => {
  it('yddd_ybrrr only when yy out of range', () => {
    const m = matchSerial('012396456', 'Gibson', { listingYear: 2009 });
    expect(m).not.toBeNull();
    expect(m!.candidates.length).toBe(1);
    expect(m!.best.brandFormat).toBe('gibson_yddd_ybrrr');
    expect(m!.best.decodedYear).toBe(2009);
  });

  it('yy_sequential only when ddd invalid', () => {
    const m = matchSerial('140005521', 'Gibson', { listingYear: 2014 });
    expect(m).not.toBeNull();
    expect(m!.candidates.length).toBe(1);
    expect(m!.best.brandFormat).toBe('gibson_yy_sequential');
    expect(m!.best.decodedYear).toBe(2014);
  });

  it('structural invariant: no dual-decode conflicts possible', () => {
    let conflicts = 0;
    for (let yy = 14; yy <= 19; yy++) {
      const p1 = yy % 10;
      for (let p2 = 0; p2 <= 9; p2++) {
        for (let p3 = 0; p3 <= 9; p3++) {
          const ddd = p1 * 100 + p2 * 10 + p3;
          if (ddd >= 1 && ddd <= 366) conflicts++;
        }
      }
    }
    expect(conflicts).toBe(0);
  });
});
