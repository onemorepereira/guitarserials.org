import { describe, expect, it } from 'vitest';
import { matchSerial } from '../src/index.js';

describe('Sire serials', () => {
  it('Gen 2 prefix', () => {
    const r = matchSerial('2N21123456', 'Sire');
    expect(r!.decodedYear).toBe(2021);
    expect(r!.brandFormat).toBe('sire_gen2');
  });

  it('Gen 1 8-digit', () => {
    const r = matchSerial('20123456', 'Sire');
    expect(r!.decodedYear).toBe(2020);
    expect(r!.brandFormat).toBe('sire_gen1');
  });

  it('Gen 1 8-digit does not match Sire format for Gibson brand', () => {
    const r = matchSerial('20123456', 'Gibson');
    expect(r).not.toBeNull();
    expect(r!.brandFormat).toBe('gibson_yddd_yrrr');
  });
});
