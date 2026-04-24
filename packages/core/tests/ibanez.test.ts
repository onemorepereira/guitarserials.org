import { describe, expect, it } from 'vitest';
import { matchSerial } from '../src/index.js';

describe('Ibanez serials', () => {
  it('Japan F 7-digit 98 = 1998', () => {
    const r = matchSerial('F9825445', 'Ibanez');
    expect(r!.decodedYear).toBe(1998);
    expect(r!.brandFormat).toBe('ibanez_japan_f');
  });

  it('Japan F 7-digit 05 = 2005', () => {
    const r = matchSerial('F0512345', 'Ibanez');
    expect(r!.decodedYear).toBe(2005);
  });

  it('Japan F 6-digit 3 = 1993', () => {
    const r = matchSerial('F320327', 'Ibanez');
    expect(r!.decodedYear).toBe(1993);
    expect(r!.brandFormat).toBe('ibanez_japan_f');
  });

  it('Japan F 6-digit 7 = 1987', () => {
    const r = matchSerial('F729859', 'Ibanez');
    expect(r!.decodedYear).toBe(1987);
  });

  it('Japan F 6-digit 0 = 1990', () => {
    const r = matchSerial('F006764', 'Ibanez');
    expect(r!.decodedYear).toBe(1990);
  });

  it('Japan F 6-digit 6 = 1996', () => {
    const r = matchSerial('F612345', 'Ibanez');
    expect(r!.decodedYear).toBe(1996);
  });

  it('pre-F letter-month Jan 1979', () => {
    const r = matchSerial('A790665', 'Ibanez');
    expect(r!.decodedYear).toBe(1979);
    expect(r!.brandFormat).toBe('ibanez_japan_letter_month');
  });

  it('pre-F letter-month Aug 1985', () => {
    const r = matchSerial('H850606', 'Ibanez');
    expect(r!.decodedYear).toBe(1985);
  });

  it('pre-F letter-month Nov 1976', () => {
    const r = matchSerial('K762803', 'Ibanez');
    expect(r!.decodedYear).toBe(1976);
  });

  it('pre-F letter-month Dec 1984', () => {
    const r = matchSerial('L840667', 'Ibanez');
    expect(r!.decodedYear).toBe(1984);
  });

  it('pre-F letter does not shadow Indonesia I', () => {
    const r = matchSerial('I12345678', 'Ibanez');
    expect(r!.brandFormat).toBe('ibanez_indonesia');
  });

  it('Indonesia I prefix (7-digit) leaves year null', () => {
    const r = matchSerial('I1234567', 'Ibanez');
    expect(r!.brandFormat).toBe('ibanez_indonesia');
    expect(r!.decodedYear).toBeNull();
  });

  it('Indonesia I prefix (9-digit YY + MM + 5-digit seq) decodes year', () => {
    // I + 16 + 06 + 00221 = June 2016, #221 — 9 digits after I.
    const r = matchSerial('I160600221', 'Ibanez');
    expect(r!.brandFormat).toBe('ibanez_indonesia');
    expect(r!.decodedYear).toBe(2016);
  });

  it('Indonesia I prefix (9-digit) with invalid month falls back to no year', () => {
    // Month=99 is invalid; should still match brand as I-prefix but with no year.
    const r = matchSerial('I169900221', 'Ibanez');
    expect(r!.brandFormat).toBe('ibanez_indonesia');
    expect(r!.decodedYear).toBeNull();
  });

  it('Korea C prefix', () => {
    const r = matchSerial('C1234567', 'Ibanez');
    expect(r!.brandFormat).toBe('ibanez_korea');
    expect(r!.decodedYear).toBeNull();
  });

  it('Korea S-prefix (Samick) decodes year 1990s', () => {
    // S4110076 = November 1994, #76
    const r = matchSerial('S4110076', 'Ibanez');
    expect(r!.brandFormat).toBe('ibanez_korea_samick');
    expect(r!.decodedYear).toBe(1994);
  });

  it('Korea S-prefix rejects Y > 5 (Samick window ended 1995)', () => {
    // S8 would imply 1998 — outside Samick's 1990-1995 window
    expect(matchSerial('S8110076', 'Ibanez')).toBeNull();
  });

  it('Korea W-prefix (World) decodes year with digit month', () => {
    // W02 + 5 (May) + 12345 = May 2002
    const r = matchSerial('W02512345', 'Ibanez');
    expect(r!.brandFormat).toBe('ibanez_korea_world');
    expect(r!.decodedYear).toBe(2002);
  });

  it('Korea W-prefix decodes year with letter month (X/Y/Z = Oct/Nov/Dec)', () => {
    // W02Y12345 = November 2002
    const r = matchSerial('W02Y12345', 'Ibanez');
    expect(r!.brandFormat).toBe('ibanez_korea_world');
    expect(r!.decodedYear).toBe(2002);
  });

  it('K-prefix Kwo Hsiao Indonesia 9-digit decodes year', () => {
    // K160600221 = June 2016, #221 (Kwo Hsiao Co., Ltd.)
    const r = matchSerial('K160600221', 'Ibanez');
    expect(r!.brandFormat).toBe('ibanez_indonesia_kwo_hsiao');
    expect(r!.decodedYear).toBe(2016);
  });

  it('K-prefix with invalid month falls back to year-null', () => {
    const r = matchSerial('K169900221', 'Ibanez');
    expect(r!.brandFormat).toBe('ibanez_indonesia_kwo_hsiao');
    expect(r!.decodedYear).toBeNull();
  });
});
