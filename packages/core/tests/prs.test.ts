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
