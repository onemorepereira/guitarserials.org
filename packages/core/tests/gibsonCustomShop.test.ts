import { describe, expect, it } from 'vitest';
import { matchSerial } from '../src/index.js';

describe('Gibson Custom Shop serials', () => {
  it('CS prefix', () => {
    const r = matchSerial('CS12345', 'Gibson Custom Shop');
    expect(r).not.toBeNull();
    expect(r!.serial).toBe('CS12345');
    expect(r!.brandFormat).toBe('gibson_cs');
    expect(r!.decodedYear).toBeNull();
  });

  it('CS prefix 3 digits', () => {
    const r = matchSerial('CS943', 'Gibson Custom Shop');
    expect(r).not.toBeNull();
    expect(r!.serial).toBe('CS943');
    expect(r!.brandFormat).toBe('gibson_cs');
  });

  it('CS prefix lowercase input', () => {
    const r = matchSerial('cs12345', 'Gibson Custom Shop');
    expect(r).not.toBeNull();
    expect(r!.serial).toBe('CS12345');
  });

  const artistCases: Array<[string, string]> = [
    ['JP1234', 'jp'],
    ['JPP123', 'jpp'],
    ['AFD1234', 'afd'],
    ['PETE123', 'pete'],
    ['ACE138', 'ace'],
    ['ANACONDA025', 'anaconda'],
    ['JOEB030', 'joeb'],
    ['JCW053', 'jcw'],
    ['SL330', 'sl'],
    ['SLASH58V060', 'slash58v'],
    ['PT041', 'pt (pete townshend)'],
    ['RG1333', 'rg (robot guitar)'],
  ];
  for (const [serial, label] of artistCases) {
    it(`artist prefix ${label} (${serial})`, () => {
      const r = matchSerial(serial, 'Gibson Custom Shop');
      expect(r).not.toBeNull();
      expect(r!.brandFormat).toBe('gibson_cs_artist');
    });
  }

  it('artist prefix ace has high tier', () => {
    const r = matchSerial('ACE138', 'Gibson Custom Shop');
    expect(r!.confidenceTier).toBe('high');
  });

  it("collector's Choice prefix", () => {
    const r = matchSerial('CC34A103', 'Gibson Custom Shop');
    expect(r).not.toBeNull();
    expect(r!.brandFormat).toBe('gibson_cs_collectors_choice');
    expect(r!.decodedYear).toBeNull();
  });

  it('historic reissue 5-digit with year', () => {
    const r = matchSerial('12345', 'Gibson Custom Shop', { listingYear: 2020 });
    expect(r).not.toBeNull();
    expect(r!.brandFormat).toBe('gibson_cs_historic');
  });

  it('historic reissue 6-digit with year', () => {
    const r = matchSerial('123456', 'Gibson Custom Shop', { listingYear: 2020 });
    expect(r).not.toBeNull();
    expect(r!.brandFormat).toBe('gibson_cs_historic');
  });

  it('historic reissue skipped without year', () => {
    expect(matchSerial('12345', 'Gibson Custom Shop')).toBeNull();
  });

  it('short numeric matches as pre-1977 for Gibson (not CS historic)', () => {
    const r = matchSerial('12345', 'Gibson');
    expect(r).not.toBeNull();
    expect(r!.brandFormat).toBe('gibson_pre1977');
  });
});

describe('Gibson CS historic gating', () => {
  it('plain Gibson 5-digit with no hint not claimed', () => {
    const m = matchSerial('12345', 'Gibson', { listingYear: 1995 });
    if (m !== null) {
      expect(m.brandFormat).not.toBe('gibson_cs_historic');
    }
  });

  it('plain Gibson with reissue hint is claimed', () => {
    const m = matchSerial('12345', 'Gibson', {
      listingYear: 1995,
      modelHint: 'Les Paul Reissue R9',
    });
    expect(m).not.toBeNull();
    expect(m!.brandFormat).toBe('gibson_cs_historic');
  });

  it('Gibson Custom Shop brand claims without hint', () => {
    const m = matchSerial('12345', 'Gibson Custom Shop', { listingYear: 1995 });
    expect(m).not.toBeNull();
    expect(m!.brandFormat).toBe('gibson_cs_historic');
  });

  it('plain Gibson historic keyword is claimed', () => {
    const m = matchSerial('12345', 'Gibson', {
      listingYear: 1995,
      modelHint: 'Les Paul Standard Historic',
    });
    expect(m).not.toBeNull();
    expect(m!.brandFormat).toBe('gibson_cs_historic');
  });

  it('plain Gibson Murphy Lab is claimed', () => {
    const m = matchSerial('12345', 'Gibson', {
      listingYear: 2020,
      modelHint: 'Les Paul Murphy Lab',
    });
    expect(m).not.toBeNull();
    expect(m!.brandFormat).toBe('gibson_cs_historic');
  });
});

describe('Gibson CS year decode', () => {
  it('CS5 snap to closest decade via listing year', () => {
    const m = matchSerial('CS10845', 'Gibson Custom Shop', { listingYear: 2001 });
    expect(m).not.toBeNull();
    expect(m!.decodedYear).toBe(2001);
    expect(m!.brandFormat).toBe('gibson_cs');
    expect(m!.confidenceTier).toBe('high');
  });

  it('CS5 same Y different decade via listing year', () => {
    const m = matchSerial('CS10845', 'Gibson Custom Shop', { listingYear: 2021 });
    expect(m).not.toBeNull();
    expect(m!.decodedYear).toBe(2021);
    expect(m!.brandFormat).toBe('gibson_cs');
  });

  it('CS no listing year leaves decoded none', () => {
    const m = matchSerial('CS10845', 'Gibson Custom Shop');
    expect(m).not.toBeNull();
    expect(m!.decodedYear).toBeNull();
    expect(m!.brandFormat).toBe('gibson_cs');
  });

  it('CS pre-1993 listing snaps up to 1995', () => {
    const m = matchSerial('CS51234', 'Gibson Custom Shop', { listingYear: 1990 });
    expect(m).not.toBeNull();
    expect(m!.decodedYear).toBe(1995);
  });

  it('CS6 dual decode double-Y preferred when matches', () => {
    const m = matchSerial('CS202150', 'Gibson Custom Shop', { listingYear: 2020 });
    expect(m).not.toBeNull();
    expect(m!.decodedYear).toBe(2020);
    expect(m!.brandFormat).toBe('gibson_cs_yyrrrr');
    expect(m!.candidates.length).toBe(2);
  });

  it('CS6 single-Y chosen when double-YY invalid', () => {
    const m = matchSerial('CS500544', 'Gibson Custom Shop', { listingYear: 2025 });
    expect(m).not.toBeNull();
    expect(m!.decodedYear).toBe(2025);
    expect(m!.brandFormat).toBe('gibson_cs');
    expect(m!.candidates.length).toBe(1);
  });

  it('CS year mismatch large gap snap', () => {
    const m2 = matchSerial('CS92345', 'Gibson Custom Shop', { listingYear: 1998 });
    expect(m2).not.toBeNull();
    expect(m2!.decodedYear).toBe(1999);
    expect(m2!.confidenceTier).toBe('high');
  });

  it('CS double-YY 90s range', () => {
    const m = matchSerial('CS942150', 'Gibson Custom Shop', { listingYear: 1994 });
    expect(m).not.toBeNull();
    expect(m!.decodedYear).toBe(1994);
    expect(m!.brandFormat).toBe('gibson_cs_yyrrrr');
  });
});
