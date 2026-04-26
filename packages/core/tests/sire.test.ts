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

  // 2N + YY + M-letter (A=Jan...L=Dec) + 5-digit seq. Observed on
  // 2025 Larry Carlton X6 batches (e.g. 2N25H70217 → August 2025).
  it('Gen 2 letter-month: 2N25H70217 → 2025/August', () => {
    const r = matchSerial('2N25H70217', 'Sire');
    expect(r).not.toBeNull();
    expect(r!.brandFormat).toBe('sire_gen2_letter_month');
    expect(r!.decodedYear).toBe(2025);
    expect(r!.decodedMonth).toBe(8);
  });

  it('Gen 2 letter-month: A = January', () => {
    const r = matchSerial('2N24A00001', 'Sire');
    expect(r).not.toBeNull();
    expect(r!.decodedYear).toBe(2024);
    expect(r!.decodedMonth).toBe(1);
  });

  it('Gen 2 letter-month: L = December', () => {
    const r = matchSerial('2N25L99999', 'Sire');
    expect(r).not.toBeNull();
    expect(r!.decodedYear).toBe(2025);
    expect(r!.decodedMonth).toBe(12);
  });

  it('Gen 2 letter-month: rejects letters outside A–L', () => {
    const r = matchSerial('2N25M70217', 'Sire');
    expect(r === null || r.brandFormat !== 'sire_gen2_letter_month').toBe(true);
  });

  it('Gen 2 all-digit unaffected by letter-month branch', () => {
    const r = matchSerial('2N21123456', 'Sire');
    expect(r!.brandFormat).toBe('sire_gen2');
    expect(r!.decodedYear).toBe(2021);
  });
});
