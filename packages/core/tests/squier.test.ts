import { describe, expect, it } from 'vitest';
import { matchSerial } from '../src/index.js';

describe('Squier', () => {
  it('ICS19123456 = Indonesia Cort 2019', () => {
    const r = matchSerial('ICS19123456', 'Squier');
    expect(r!.decodedYear).toBe(2019);
    expect(r!.brandFormat).toBe('squier_ics');
  });

  it('ISS21123456 = Indonesia Samick 2021', () => {
    const r = matchSerial('ISS21123456', 'Squier');
    expect(r!.decodedYear).toBe(2021);
    expect(r!.brandFormat).toBe('squier_iss');
  });

  it('CGS0912345 = China Guangzhou 2009', () => {
    const r = matchSerial('CGS0912345', 'Squier');
    expect(r!.decodedYear).toBe(2009);
    expect(r!.brandFormat).toBe('squier_cgs');
  });

  it('CN12123456 = China Cor-Tek 2012', () => {
    const r = matchSerial('CN12123456', 'Squier');
    expect(r!.decodedYear).toBe(2012);
    expect(r!.brandFormat).toBe('squier_cn');
  });

  it('MN4123456 = Mexico 1994 (shared with Fender)', () => {
    const r = matchSerial('MN4123456', 'Squier');
    expect(r!.decodedYear).toBe(1994);
    expect(r!.brandFormat).toBe('squier_mn');
  });

  it('MZ5123456 = Mexico 2005 (shared with Fender)', () => {
    const r = matchSerial('MZ5123456', 'Squier');
    expect(r!.decodedYear).toBe(2005);
    expect(r!.brandFormat).toBe('squier_mz');
  });
});
