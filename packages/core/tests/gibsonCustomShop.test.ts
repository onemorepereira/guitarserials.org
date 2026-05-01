import { describe, expect, it } from 'vitest';
import { matchSerial } from '../src/index.js';

describe('Gibson Custom Shop serials', () => {
  it('CS prefix', () => {
    // 2026-05-01: matchSerial defaults todayYear to current year, so
    // CS-prefix with no listing year now decodes to most-recent valid
    // year (was null before). Pure-format assertions are the stable bits.
    const r = matchSerial('CS12345', 'Gibson Custom Shop');
    expect(r).not.toBeNull();
    expect(r!.serial).toBe('CS12345');
    expect(r!.brandFormat).toBe('gibson_cs');
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

  it('historic R9 reissue 991234 = 1959 reissue built in 1999', () => {
    const r = matchSerial('991234', 'Gibson Custom Shop', { listingYear: 1999 });
    expect(r!.brandFormat).toBe('gibson_cs_historic');
    expect(r!.decodedYear).toBe(1999);
  });

  it('historic R8 reissue 881234 = 1958 reissue built in 2008 (listing year context)', () => {
    const r = matchSerial('881234', 'Gibson Custom Shop', { listingYear: 2008 });
    expect(r!.decodedYear).toBe(2008);
  });

  it('historic R4 reissue 441234 = 1954 reissue built in 2004', () => {
    const r = matchSerial('441234', 'Gibson Custom Shop', { listingYear: 2004 });
    expect(r!.decodedYear).toBe(2004);
  });

  it('historic R0 reissue 001234 = 1960 reissue built in 2010', () => {
    const r = matchSerial('001234', 'Gibson Custom Shop', { listingYear: 2010 });
    expect(r!.decodedYear).toBe(2010);
  });

  it('non-R-series 5-digit historic leaves year null', () => {
    // First digit 1 is not a valid R-series model digit.
    const r = matchSerial('12345', 'Gibson Custom Shop', { listingYear: 2020 });
    expect(r!.brandFormat).toBe('gibson_cs_historic');
    expect(r!.decodedYear).toBeNull();
  });

  it('historic reissue matches format without listing year, year null', () => {
    // Without a listing year we can't pin the build year, but the format is
    // still a Custom Shop historic reissue — claim it with year null so the
    // user gets a format identification. First digit 1 is not R-series so
    // year would be null regardless.
    const r = matchSerial('12345', 'Gibson Custom Shop');
    expect(r).not.toBeNull();
    expect(r!.brandFormat).toBe('gibson_cs_historic');
    expect(r!.decodedYear).toBeNull();
  });

  it('historic R9 reissue 92414 without listing year matches format, year null', () => {
    // First digit 9 = R9/1959 reissue, second digit 2 = build-year digit
    // (2002, 2012, 2022). Without a listing year we can't pick among the
    // decades — format matches, year left null.
    const r = matchSerial('92414', 'Gibson Custom Shop');
    expect(r).not.toBeNull();
    expect(r!.brandFormat).toBe('gibson_cs_historic');
    expect(r!.decodedYear).toBeNull();
  });

  it('historic R9 reissue 92414 with listing year snaps to decade', () => {
    const r = matchSerial('92414', 'Gibson Custom Shop', { listingYear: 2014 });
    expect(r!.brandFormat).toBe('gibson_cs_historic');
    expect(r!.decodedYear).toBe(2012);
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

  it('CS no listing year still decodes via todayYear default', () => {
    // 2026-05-01: behaviour change. matchSerial now defaults todayYear
    // to current year, so even without a listingYear we get a year.
    // Y=1 → year ends in 1 (could be 1991/2001/2011/2021/2031...).
    const m = matchSerial('CS10845', 'Gibson Custom Shop');
    expect(m).not.toBeNull();
    expect(m!.brandFormat).toBe('gibson_cs');
    expect(m!.decodedYear).not.toBeNull();
    expect(m!.decodedYear! % 10).toBe(1);
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

describe('Gibson CS — todayYear fallback when no listing year', () => {
  // Mirrored from reverb-scrapper sibling project (commit 323b0b9).
  // Single-digit Y in CSYRRRR collides every 10 years across
  // 1990s/2000s/2010s/2020s. With no listing year, bias to the most-
  // recent valid year ≤ todayYear. Right ~70%+ of the time given
  // current production volume.

  it('biases to most-recent valid year ≤ todayYear when no listing year', () => {
    // CS500091 — Y=5 → options [1995, 2005, 2015, 2025] → cap at 2026 → 2025.
    const r = matchSerial('CS500091', 'Gibson Custom Shop', { todayYear: 2026 });
    expect(r!.brandFormat).toBe('gibson_cs');
    expect(r!.decodedYear).toBe(2025);
  });

  it('listing year still wins over todayYear when both supplied', () => {
    const r = matchSerial('CS500091', 'Gibson Custom Shop', {
      listingYear: 2005,
      todayYear: 2026,
    });
    expect(r!.decodedYear).toBe(2005);
  });

  it('todayYear too old for any valid decade returns null year', () => {
    // CS launched 1993; todayYear=1991 means even Y=4 → 1994 is in the future.
    const r = matchSerial('CS50001', 'Gibson Custom Shop', { todayYear: 1991 });
    expect(r!.decodedYear).toBeNull();
  });

  it('plain Gibson brand also benefits (sellers often mis-tag)', () => {
    // Mirror of reverb-side test_cs_via_plain_gibson_brand_propagates_today_year.
    const r = matchSerial('CS600945', 'Gibson', {
      modelHint: 'Les Paul Custom',
      todayYear: 2026,
    });
    expect(r!.brandFormat).toBe('gibson_cs');
    expect(r!.decodedYear).toBe(2026);
  });

  it('matchSerial defaults todayYear to current calendar year', () => {
    // Without explicit todayYear, the dispatcher still applies the
    // bias-to-recent fallback. Y=1 → year ends in 1.
    const r = matchSerial('CS10845', 'Gibson Custom Shop');
    expect(r!.decodedYear).not.toBeNull();
    expect(r!.decodedYear! % 10).toBe(1);
  });
});

describe('Gibson CS — Murphy Lab letter-suffix', () => {
  // Mirrored from reverb-scrapper sibling project (commit 323b0b9).
  // Tom Murphy's hand-aged Custom Shop instruments use letters in the
  // body (CSLB<run-letter>[<seq>]). Year is not encoded in the serial.

  it('CSLBH recognized as Murphy Lab format', () => {
    const r = matchSerial('CSLBH', 'Gibson Custom Shop');
    expect(r!.brandFormat).toBe('gibson_cs_murphy_lab');
    expect(r!.decodedYear).toBeNull();
  });

  it('CSLBA1234 (letter + sequential) recognized as Murphy Lab format', () => {
    const r = matchSerial('CSLBA1234', 'Gibson Custom Shop');
    expect(r!.brandFormat).toBe('gibson_cs_murphy_lab');
  });

  it('Murphy Lab also resolves under plain Gibson brand', () => {
    const r = matchSerial('CSLBH', 'Gibson');
    expect(r!.brandFormat).toBe('gibson_cs_murphy_lab');
  });
});
