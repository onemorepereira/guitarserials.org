import { describe, expect, it } from 'vitest';
import { matchSerial } from '../src/index.js';

describe('Ernie Ball Music Man', () => {
  it('B027100 matches as B-prefix', () => {
    const r = matchSerial('B027100', 'Music Man');
    expect(r!.brandFormat).toBe('musicman_b_prefix');
    expect(r!.decodedYear).toBeNull();
  });

  it('F12345 matches as F-prefix', () => {
    const r = matchSerial('F12345', 'Music Man');
    expect(r!.brandFormat).toBe('musicman_f_prefix');
  });

  it('5-digit 8xxxx matches (EVH/Axis line)', () => {
    const r = matchSerial('85123', 'Music Man');
    expect(r!.brandFormat).toBe('musicman_5digit');
  });

  it('5-digit 9xxxx matches (Morse/Luke/Silhouette)', () => {
    const r = matchSerial('92345', 'Music Man');
    expect(r!.brandFormat).toBe('musicman_5digit');
  });

  it('brand name is case-insensitive', () => {
    expect(matchSerial('B027100', 'MUSIC MAN')).not.toBeNull();
  });
});
