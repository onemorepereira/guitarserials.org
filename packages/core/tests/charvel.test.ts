import { describe, expect, it } from 'vitest';
import { matchSerial } from '../src/index.js';

describe('Charvel', () => {
  it('JC18000123 = Japan 2018', () => {
    const r = matchSerial('JC18000123', 'Charvel');
    expect(r).not.toBeNull();
    expect(r!.decodedYear).toBe(2018);
    expect(r!.brandFormat).toBe('charvel_japan');
    expect(r!.confidenceTier).toBe('high');
  });

  it('4-digit San Dimas serial matches with null year', () => {
    // 2500 falls within the 1983 range (1725-2938) but we don't bake the
    // cumulative table into the matcher; year is left null.
    const r = matchSerial('2500', 'Charvel');
    expect(r).not.toBeNull();
    expect(r!.brandFormat).toBe('charvel_san_dimas');
    expect(r!.decodedYear).toBeNull();
  });

  it('San Dimas range starts at 1001 (not lower)', () => {
    // 0999 falls below the 1981 start; matcher rejects it.
    expect(matchSerial('0999', 'Charvel')).toBeNull();
  });
});
