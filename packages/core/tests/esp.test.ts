import { describe, expect, it } from 'vitest';
import { matchSerial } from '../src/index.js';

describe('ESP / LTD', () => {
  it('E-prefix (Korea) matches with null year', () => {
    const r = matchSerial('E1234567', 'ESP');
    expect(r!.brandFormat).toBe('esp_import');
    expect(r!.decodedYear).toBeNull();
  });

  it('L-prefix (China) matches', () => {
    const r = matchSerial('L1234567', 'LTD');
    expect(r!.brandFormat).toBe('esp_import');
  });

  it('W-prefix (World Korea) matches with 8-digit suffix', () => {
    const r = matchSerial('W12345678', 'ESP');
    expect(r!.brandFormat).toBe('esp_world_korea');
  });

  it('IS-prefix Indonesia 7-digit matches', () => {
    const r = matchSerial('IS1234567', 'LTD');
    expect(r!.brandFormat).toBe('esp_import');
  });

  it('invalid factory prefix rejected', () => {
    expect(matchSerial('Z1234567', 'ESP')).toBeNull();
  });
});
