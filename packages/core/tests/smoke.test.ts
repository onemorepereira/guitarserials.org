import { describe, expect, it } from 'vitest';
import { matchSerial } from '../src/index.js';

describe('@guitarserials/core smoke', () => {
  it('exports matchSerial as a function', () => {
    expect(typeof matchSerial).toBe('function');
  });

  it('returns null for unknown brands (stub behavior)', () => {
    expect(matchSerial('123', 'gibson')).toBeNull();
  });
});
