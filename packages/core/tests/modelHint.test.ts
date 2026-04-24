import { describe, expect, it } from 'vitest';
import { matchSerial } from '../src/index.js';

describe('Model hint', () => {
  it('LP Classic 1989-1999 short numeric', () => {
    const m = matchSerial('04759', 'Gibson', {
      listingYear: 1995,
      modelHint: 'Les Paul Classic',
    });
    expect(m).not.toBeNull();
    expect(m!.brandFormat).toBe('gibson_lp_classic_1989_1999');
  });

  it('LP Classic 2000-2014 YY prefix', () => {
    const m = matchSerial('054438', 'Gibson', {
      listingYear: 2005,
      modelHint: 'Les Paul Classic',
    });
    expect(m).not.toBeNull();
    expect(m!.brandFormat).toBe('gibson_lp_classic_2000_2014');
    expect(m!.decodedYear).toBe(2005);
  });

  it('1994 Centennial "94" + 6-digit pattern is intentionally not claimed', () => {
    // The removed gibson_1994_centennial rule was overly loose. The real
    // Centennial was a ~14-unit run using a distinct YYYY-MM serial format.
    // See doc/audits/2026-04-23-source-audit.md §2.
    const m = matchSerial('94006542', 'Gibson', { listingYear: 1994 });
    if (m !== null) {
      expect(m.brandFormat).not.toBe('gibson_1994_centennial');
    }
  });

  it('LP Classic without model hint falls through', () => {
    const m = matchSerial('04759', 'Gibson', { listingYear: 1995 });
    if (m !== null) {
      expect(m.brandFormat).not.toBe('gibson_lp_classic_1989_1999');
    }
  });

  it('LP Classic rejects wrong model (SG Standard Classic White)', () => {
    const m = matchSerial('04759', 'Gibson', {
      listingYear: 1995,
      modelHint: 'SG Standard Classic White',
    });
    if (m !== null) {
      expect(m.brandFormat).not.toBe('gibson_lp_classic_1989_1999');
    }
  });

  it('LP Classic accepts "Les Paul Classic Plus"', () => {
    const m = matchSerial('04759', 'Gibson', {
      listingYear: 1995,
      modelHint: 'Les Paul Classic Plus',
    });
    expect(m).not.toBeNull();
    expect(m!.brandFormat).toBe('gibson_lp_classic_1989_1999');
  });

  it('LP Classic preempts CS historic', () => {
    const m = matchSerial('054438', 'Gibson', {
      listingYear: 2005,
      modelHint: 'Les Paul Classic',
    });
    expect(m).not.toBeNull();
    expect(m!.brandFormat).toBe('gibson_lp_classic_2000_2014');
  });
});
