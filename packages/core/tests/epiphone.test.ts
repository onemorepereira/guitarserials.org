import { describe, expect, it } from 'vitest';
import { matchSerial } from '../src/index.js';

describe('Epiphone', () => {
  it('SI03021234 = Samick Indonesia, February 2003', () => {
    const r = matchSerial('SI03021234', 'Epiphone');
    expect(r).not.toBeNull();
    expect(r!.decodedYear).toBe(2003);
    expect(r!.brandFormat).toBe('epiphone_factory');
    expect(r!.confidenceTier).toBe('high');
  });

  it('EE08091234 = Qingdao Electric China, September 2008', () => {
    const r = matchSerial('EE08091234', 'Epiphone');
    expect(r!.decodedYear).toBe(2008);
  });

  it('S9911 single-letter factory code decodes year (Samick Korea 1999)', () => {
    // S + 99 + 11 + 1234 = 9 char total — does not match (needs 8 or 9 chars).
    // Let's test the format properly: 1-letter factory + YY + MM + 4-digit = 8 chars total.
    const r = matchSerial('S99111234', 'Epiphone');
    expect(r!.decodedYear).toBe(1999);
    expect(r!.brandFormat).toBe('epiphone_factory');
  });

  it('2008+ all-numeric: 1210123456 = December 2012', () => {
    const r = matchSerial('1210123456', 'Epiphone');
    expect(r!.decodedYear).toBe(2012);
    expect(r!.brandFormat).toBe('epiphone_numeric');
  });

  it('unknown factory prefix rejected', () => {
    expect(matchSerial('ZZ03021234', 'Epiphone')).toBeNull();
  });
});
