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

  it('Indonesia I prefix', () => {
    const r = matchSerial('I12345678', 'Ibanez');
    expect(r!.brandFormat).toBe('ibanez_indonesia');
  });

  it('Korea C prefix', () => {
    const r = matchSerial('C1234567', 'Ibanez');
    expect(r!.brandFormat).toBe('ibanez_korea');
  });
});
