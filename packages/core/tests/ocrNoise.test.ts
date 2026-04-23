import { describe, expect, it } from 'vitest';
import { matchSerial } from '../src/index.js';

describe('OCR noise normalization', () => {
  it('leading/trailing whitespace stripped', () => {
    const r = matchSerial('  US12345678  ', 'Fender');
    expect(r!.serial).toBe('US12345678');
  });

  it('lowercase converted', () => {
    const r = matchSerial('us12345678', 'Fender');
    expect(r!.serial).toBe('US12345678');
  });

  it('mixed case brand accepted', () => {
    expect(matchSerial('US12345678', 'fender')).not.toBeNull();
  });

  it('internal whitespace stripped', () => {
    const r = matchSerial('US 12345678', 'Fender');
    expect(r!.serial).toBe('US12345678');
  });
});
