import { describe, expect, it } from 'vitest';
import { matchSerial } from '../src/index.js';

describe('Unsupported brand', () => {
  it('Seymour Duncan returns null', () => {
    expect(matchSerial('12345678', 'Seymour Duncan')).toBeNull();
  });
  it('Boss returns null', () => {
    expect(matchSerial('AB123456', 'Boss')).toBeNull();
  });
  it('Bugera returns null', () => {
    expect(matchSerial('12345678', 'Bugera')).toBeNull();
  });
  it('empty brand returns null', () => {
    expect(matchSerial('12345678', '')).toBeNull();
  });
});
