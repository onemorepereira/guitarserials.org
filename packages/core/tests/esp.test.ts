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

  it('pre-2000 DDMMYNNN 8-digit with listing year snaps to correct decade', () => {
    // 25055012 = 25 May 1995, #12. With listingYear 1995, snaps to 1995.
    const r = matchSerial('25055012', 'ESP', { listingYear: 1995 });
    expect(r!.brandFormat).toBe('esp_pre2000_japan');
    expect(r!.decodedYear).toBe(1995);
  });

  it('pre-2000 DDMMYNNN without listing year returns null year but matches format', () => {
    const r = matchSerial('25055012', 'ESP');
    expect(r!.brandFormat).toBe('esp_pre2000_japan');
    expect(r!.decodedYear).toBeNull();
  });

  it('pre-2000 DDMMYNNN with invalid day rejected', () => {
    // 35 is not a valid day
    expect(matchSerial('35055012', 'ESP')).toBeNull();
  });
});
