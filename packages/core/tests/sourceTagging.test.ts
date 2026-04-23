import { describe, expect, it } from 'vitest';
import { matchSerial } from '../src/index.js';

describe('Source tagging (bridge + stamped)', () => {
  it('Fender AVRI bridge plate tagged', () => {
    const m = matchSerial('9978', 'Fender', {
      listingYear: 1988,
      modelHint: "American Vintage '52 Telecaster",
    });
    expect(m).not.toBeNull();
    expect(m!.best.sourceTag).toBe('bridge');
    expect(m!.best.confidenceCap).toBe('medium');
    expect(m!.best.brandFormat).toBe('fender_avri_bridge');
    expect(m!.confidenceTier).toBe('medium');
  });

  it('Fender AVRI bridge requires model hint', () => {
    const m = matchSerial('9978', 'Fender', { listingYear: 1988 });
    if (m !== null) {
      expect(m.best.sourceTag).not.toBe('bridge');
      expect(m.best.brandFormat).not.toBe('fender_avri_bridge');
    }
  });

  it('Fender AVRI rejects non-AVRI model', () => {
    const m = matchSerial('9978', 'Fender', {
      listingYear: 1988,
      modelHint: 'American Professional Stratocaster',
    });
    if (m !== null) {
      expect(m.best.brandFormat).not.toBe('fender_avri_bridge');
    }
  });

  it('Gibson pre-1961 stamped tagged', () => {
    const m = matchSerial('6370', 'Gibson', {
      listingYear: 1958,
      modelHint: 'Les Paul Junior',
    });
    expect(m).not.toBeNull();
    expect(m!.best.sourceTag).toBe('stamped');
    expect(m!.best.confidenceCap).toBe('medium');
    expect(m!.best.brandFormat).toBe('gibson_pre1961');
    expect(m!.confidenceTier).toBe('medium');
  });

  it('Gibson pre-1961 requires Junior/Special model', () => {
    const m = matchSerial('6370', 'Gibson', {
      listingYear: 1958,
      modelHint: 'Les Paul Standard',
    });
    if (m !== null) {
      expect(m.best.sourceTag).not.toBe('stamped');
      expect(m.best.brandFormat).not.toBe('gibson_pre1961');
    }
  });

  it('Fender AVRI rejects "vintage" substring on non-AVRI pickups', () => {
    const m = matchSerial('9978', 'Fender', {
      listingYear: 2020,
      modelHint: 'American Pro II with Vintage Noiseless pickups',
    });
    if (m !== null) {
      expect(m.best.brandFormat).not.toBe('fender_avri_bridge');
    }
  });

  it("Fender AVRI accepts '60s quoted-year-with-s", () => {
    const m = matchSerial('12345', 'Fender', {
      listingYear: 2015,
      modelHint: "Vintera '60s Stratocaster",
    });
    expect(m).not.toBeNull();
    expect(m!.best.brandFormat).toBe('fender_avri_bridge');
  });

  it('Gibson pre-1961 rejects Junior Brown signature', () => {
    const m = matchSerial('6370', 'Gibson', {
      listingYear: 1990,
      modelHint: 'Junior Brown signature',
    });
    if (m !== null) {
      expect(m.best.brandFormat).not.toBe('gibson_pre1961');
    }
  });

  it('Gibson pre-1961 rejects Special Edition marketing', () => {
    const m = matchSerial('6370', 'Gibson', {
      listingYear: 2015,
      modelHint: 'Les Paul Standard Special Edition',
    });
    if (m !== null) {
      expect(m.best.brandFormat).not.toBe('gibson_pre1961');
    }
  });
});
