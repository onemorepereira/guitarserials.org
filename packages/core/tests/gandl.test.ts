import { describe, expect, it } from 'vitest';
import { matchSerial } from '../src/index.js';

describe('G&L', () => {
  it('CLF0304012 = CLF era, April 2003 #012 (YY+MM+3-digit rank = 7 digits)', () => {
    const r = matchSerial('CLF0304012', 'G&L');
    expect(r).not.toBeNull();
    expect(r!.decodedYear).toBe(2003);
    expect(r!.brandFormat).toBe('gandl_clf_dated');
    expect(r!.confidenceTier).toBe('high');
  });

  it('CLF123456 (6-digit cumulative, 2011+) matches with null year', () => {
    const r = matchSerial('CLF123456', 'G&L');
    expect(r!.brandFormat).toBe('gandl_clf_cumulative');
    expect(r!.decodedYear).toBeNull();
  });

  it('CL12345 transitional (late 1997-1998) matches with null year', () => {
    const r = matchSerial('CL12345', 'G&L');
    expect(r!.brandFormat).toBe('gandl_cl_transitional');
    expect(r!.decodedYear).toBeNull();
  });

  it('G123456 = guitar, 1980-1997 era', () => {
    const r = matchSerial('G123456', 'G&L');
    expect(r!.brandFormat).toBe('gandl_g_prefix');
    expect(r!.decodedYear).toBeNull();
  });

  it('B123456 = bass, 1980-1997 era', () => {
    const r = matchSerial('B123456', 'G&L');
    expect(r!.brandFormat).toBe('gandl_b_prefix');
    expect(r!.decodedYear).toBeNull();
  });

  it('20210009 = Placentia China 2021', () => {
    const r = matchSerial('20210009', 'G&L');
    expect(r!.decodedYear).toBe(2021);
    expect(r!.brandFormat).toBe('gandl_placentia');
  });

  it('Tribute Korea 14020123 = February 2014', () => {
    const r = matchSerial('14020123', 'G&L');
    expect(r!.decodedYear).toBe(2014);
    expect(r!.brandFormat).toBe('gandl_tribute_korea');
  });

  it('Tribute Indonesia 140214831 = February 2014', () => {
    const r = matchSerial('140214831', 'G&L');
    expect(r!.decodedYear).toBe(2014);
    expect(r!.brandFormat).toBe('gandl_tribute_indonesia');
  });

  it('Tribute China L14021234 = February 2014', () => {
    const r = matchSerial('L14021234', 'G&L');
    expect(r!.decodedYear).toBe(2014);
    expect(r!.brandFormat).toBe('gandl_tribute_china');
  });
});
