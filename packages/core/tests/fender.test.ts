import { describe, expect, it } from 'vitest';
import { matchSerial } from '../src/index.js';

describe('Fender serials', () => {
  it('US prefix year decode', () => {
    const r = matchSerial('US12345678', 'Fender');
    expect(r).not.toBeNull();
    expect(r!.serial).toBe('US12345678');
    expect(r!.decodedYear).toBe(2012);
    expect(r!.brandFormat).toBe('fender_us_prefix');
  });

  it('US prefix year 2020s', () => {
    const r = matchSerial('US23456789', 'Fender');
    expect(r!.decodedYear).toBe(2023);
  });

  it('US prefix rework suffix', () => {
    const r = matchSerial('US24002164A', 'Fender');
    expect(r).not.toBeNull();
    expect(r!.serial).toBe('US24002164A');
    expect(r!.decodedYear).toBe(2024);
    expect(r!.brandFormat).toBe('fender_us_prefix');
  });

  it('MX prefix rework suffix', () => {
    const r = matchSerial('MX22034567B', 'Fender');
    expect(r).not.toBeNull();
    expect(r!.serial).toBe('MX22034567B');
    expect(r!.decodedYear).toBe(2022);
  });

  it('US prefix 6 digits', () => {
    const r = matchSerial('US140268', 'Fender');
    expect(r!.decodedYear).toBe(2014);
    expect(r!.brandFormat).toBe('fender_us_prefix');
  });

  it('US prefix 9 digits', () => {
    const r = matchSerial('US210007169', 'Fender');
    expect(r!.decodedYear).toBe(2021);
    expect(r!.brandFormat).toBe('fender_us_prefix');
  });

  it('N prefix 7 digits', () => {
    const r = matchSerial('N2924846', 'Fender');
    expect(r!.decodedYear).toBe(1992);
    expect(r!.brandFormat).toBe('fender_n_prefix');
  });

  it('MX prefix year decode', () => {
    const r = matchSerial('MX18123456', 'Fender');
    expect(r!.decodedYear).toBe(2018);
    expect(r!.brandFormat).toBe('fender_mx');
  });

  it('Z prefix', () => {
    const r = matchSerial('Z5123456', 'Fender');
    expect(r!.decodedYear).toBe(2005);
    expect(r!.brandFormat).toBe('fender_z_prefix');
  });

  it('DZ prefix', () => {
    const r = matchSerial('DZ0123456', 'Fender');
    expect(r!.decodedYear).toBe(2000);
    expect(r!.brandFormat).toBe('fender_dz_prefix');
  });

  it('N prefix', () => {
    const r = matchSerial('N412345', 'Fender');
    expect(r!.decodedYear).toBe(1994);
    expect(r!.brandFormat).toBe('fender_n_prefix');
  });

  it('S prefix', () => {
    const r = matchSerial('S712345', 'Fender');
    expect(r!.decodedYear).toBe(1977);
    expect(r!.brandFormat).toBe('fender_s_prefix');
  });

  it('E prefix', () => {
    const r = matchSerial('E312345', 'Fender');
    expect(r!.decodedYear).toBe(1983);
    expect(r!.brandFormat).toBe('fender_e_prefix');
  });

  it('V prefix no year (pre-2012 sequential)', () => {
    const r = matchSerial('V12345', 'Fender');
    expect(r!.decodedYear).toBeNull();
    expect(r!.brandFormat).toBe('fender_avri_v_prefix');
  });

  it('V prefix + 7 digits decodes year for AVRI II (2012+)', () => {
    // Post-mid-2012 AVRI II: V + YY + 5 digits. V1512345 → 2015.
    const r = matchSerial('V1512345', 'Fender');
    expect(r!.decodedYear).toBe(2015);
    expect(r!.brandFormat).toBe('fender_avri_v_prefix');
    expect(r!.confidenceTier).toBe('high');
  });

  it('V prefix + 7 digits with implausible YY falls back to no-year', () => {
    // V + 99 + 5 digits — 99 is not a plausible AVRI II year; keep null year.
    const r = matchSerial('V9912345', 'Fender');
    expect(r!.decodedYear).toBeNull();
    expect(r!.brandFormat).toBe('fender_avri_v_prefix');
  });

  it('JD prefix', () => {
    const r = matchSerial('JD15123456', 'Fender');
    expect(r!.decodedYear).toBe(2015);
    expect(r!.brandFormat).toBe('fender_jd');
  });

  it('invalid prefix rejected', () => {
    expect(matchSerial('XX12345678', 'Fender')).toBeNull();
  });

  it('MS prefix Mod Shop', () => {
    const r = matchSerial('MS233158', 'Fender');
    expect(r!.decodedYear).toBe(2023);
    expect(r!.brandFormat).toBe('fender_mod_shop');
  });

  it('MS prefix Mod Shop 2025', () => {
    const r = matchSerial('MS255754', 'Fender');
    expect(r!.decodedYear).toBe(2025);
  });

  it('R prefix CS Time Machine', () => {
    const r = matchSerial('R137487', 'Fender');
    expect(r!.decodedYear).toBeNull();
    expect(r!.brandFormat).toBe('fender_cs_time_machine');
  });

  it('R prefix CS Time Machine short', () => {
    const r = matchSerial('R12345', 'Fender');
    expect(r!.brandFormat).toBe('fender_cs_time_machine');
  });

  it('XN prefix American Custom', () => {
    const r = matchSerial('XN16552', 'Fender');
    expect(r!.decodedYear).toBeNull();
    expect(r!.brandFormat).toBe('fender_cs_american_custom');
  });
});

describe('Fender prefix year-plausibility gates', () => {
  it('US + implausible YY (e.g. 88) returns year null but still matches format', () => {
    // US prefix launched in 2000; YY=88 (1988) is nonsense but we want to
    // still recognize the format rather than rejecting outright.
    const r = matchSerial('US88123456', 'Fender');
    expect(r!.brandFormat).toBe('fender_us_prefix');
    expect(r!.decodedYear).toBeNull();
  });

  it('US + YY=00 decodes to 2000 (first year of US prefix)', () => {
    const r = matchSerial('US00123456', 'Fender');
    expect(r!.decodedYear).toBe(2000);
  });

  it('MX + YY=07 (before MX launch in 2009) returns year null', () => {
    const r = matchSerial('MX07123456', 'Fender');
    expect(r!.brandFormat).toBe('fender_mx');
    expect(r!.decodedYear).toBeNull();
  });

  it('MX + YY=09 (first year of MX) decodes correctly', () => {
    const r = matchSerial('MX09123456', 'Fender');
    expect(r!.decodedYear).toBe(2009);
  });

  it('VS + YY=15 (before Vintera launch 2019) returns year null', () => {
    const r = matchSerial('VS150042', 'Fender');
    expect(r!.brandFormat).toBe('fender_vs');
    expect(r!.decodedYear).toBeNull();
  });

  it('VS + YY=19 decodes to 2019 (first Vintera year)', () => {
    const r = matchSerial('VS190042', 'Fender');
    expect(r!.decodedYear).toBe(2019);
  });

  it('JD + YY=08 (before JD launch 2011) returns year null', () => {
    const r = matchSerial('JD08123456', 'Fender');
    expect(r!.brandFormat).toBe('fender_jd');
    expect(r!.decodedYear).toBeNull();
  });

  it('MS + YY=18 (before Mod Shop launch 2021) returns year null', () => {
    const r = matchSerial('MS180042', 'Fender');
    expect(r!.brandFormat).toBe('fender_mod_shop');
    expect(r!.decodedYear).toBeNull();
  });
});

describe('Fender vintage neckplate formats', () => {
  it('L-series 1963-1965 matches', () => {
    const r = matchSerial('L12345', 'Fender');
    expect(r).not.toBeNull();
    expect(r!.brandFormat).toBe('fender_l_series');
    expect(r!.decodedYear).toBeNull();
  });

  it('6-digit pre-1976 neckplate matches with null year', () => {
    const r = matchSerial('234567', 'Fender');
    expect(r!.brandFormat).toBe('fender_pre1976_neckplate');
    expect(r!.decodedYear).toBeNull();
  });

  it('8-digit bare numeric matches the legacy fender_neckplate fallback', () => {
    const r = matchSerial('12345678', 'Fender');
    expect(r!.brandFormat).toBe('fender_neckplate');
  });
});

describe('Fender Japan JV/SQ (1982-1984)', () => {
  it('JV + 5 digits matches with null year (no USA conflict)', () => {
    const r = matchSerial('JV12345', 'Fender');
    expect(r).not.toBeNull();
    expect(r!.brandFormat).toBe('fender_japan_jv');
    expect(r!.confidenceTier).toBe('high');
  });

  it('JV + 6 digits also matches', () => {
    const r = matchSerial('JV123456', 'Fender');
    expect(r!.brandFormat).toBe('fender_japan_jv');
  });

  it('SQ + 5 digits matches (Squier Japan format, 1983-1984)', () => {
    const r = matchSerial('SQ12345', 'Fender');
    expect(r).not.toBeNull();
    expect(r!.brandFormat).toBe('fender_japan_sq');
  });
});

describe('Fender decade prefixes', () => {
  it('S prefix 1970s', () => {
    const m = matchSerial('S654321', 'Fender', { listingYear: 1976 });
    expect(m!.brandFormat).toBe('fender_s_prefix');
    expect(m!.decodedYear).toBe(1976);
  });

  it('E prefix 1980s', () => {
    const m = matchSerial('E421426', 'Fender', { listingYear: 1984 });
    expect(m!.brandFormat).toBe('fender_e_prefix');
    expect(m!.decodedYear).toBe(1984);
    expect(m!.confidenceTier).toBe('high');
  });

  it('N prefix 1990s', () => {
    const m = matchSerial('N8357086', 'Fender', { listingYear: 1998 });
    expect(m!.brandFormat).toBe('fender_n_prefix');
    expect(m!.decodedYear).toBe(1998);
  });

  it('Z prefix 2000s', () => {
    const m = matchSerial('Z2218688', 'Fender', { listingYear: 2002 });
    expect(m!.brandFormat).toBe('fender_z_prefix');
    expect(m!.decodedYear).toBe(2002);
  });

  it('DZ prefix Deluxe', () => {
    const m = matchSerial('DZ5123456', 'Fender', { listingYear: 2005 });
    expect(m!.brandFormat).toBe('fender_dz_prefix');
    expect(m!.decodedYear).toBe(2005);
  });

  it('V prefix AVRI no year', () => {
    const m = matchSerial('V123456', 'Fender', { listingYear: 2005 });
    expect(m!.brandFormat).toBe('fender_avri_v_prefix');
    expect(m!.decodedYear).toBeNull();
    expect(m!.confidenceTier).toBe('high');
  });

  it('CS prefix Custom Shop', () => {
    const m = matchSerial('CS123456', 'Fender', { listingYear: 2010 });
    expect(m!.brandFormat).toBe('fender_cs');
    expect(m!.decodedYear).toBeNull();
  });

  it('E prefix year mismatch demotes', () => {
    const m = matchSerial('E421426', 'Fender', { listingYear: 1995 });
    expect(m!.confidenceTier).toBe('rejected');
  });
});

// Fender Japan ("Crafted in Japan", MIJ) reissues from 1997-2015 reuse
// the USA vintage-style S/E decade prefixes (e.g. S025075 on a 2008
// ST62-US) but do NOT encode the year. The unmodified S/E decade-prefix
// decoder would mis-label them as 1970/1980. The MIJ branch must run
// before the decade-prefix loop and emit a no-year candidate.
describe('Fender MIJ vintage reissue (S/E with Japan context)', () => {
  it('S025075 with explicit MIJ model_hint returns no year', () => {
    const r = matchSerial('S025075', 'Fender', {
      listingYear: 2008,
      modelHint: 'ST62-US MIJ Stratocaster',
    });
    expect(r).not.toBeNull();
    expect(r!.brandFormat).toBe('fender_mij_vintage_reissue');
    expect(r!.decodedYear).toBeNull();
  });

  it('S025075 with "Crafted in Japan" model_hint returns no year', () => {
    const r = matchSerial('S025075', 'Fender', {
      listingYear: 2008,
      modelHint: 'Stratocaster Crafted in Japan 62 Reissue',
    });
    expect(r!.brandFormat).toBe('fender_mij_vintage_reissue');
    expect(r!.decodedYear).toBeNull();
  });

  it('S025075 with MIJ model code (ST62) and no MIJ keyword returns no year', () => {
    const r = matchSerial('S025075', 'Fender', {
      listingYear: 2008,
      modelHint: 'ST62-US Olympic White',
    });
    expect(r!.brandFormat).toBe('fender_mij_vintage_reissue');
    expect(r!.decodedYear).toBeNull();
  });

  it('S025075 with post-1997 vintage reissue context returns no year', () => {
    const r = matchSerial('S025075', 'Fender', {
      listingYear: 2008,
      modelHint: "American Vintage Reissue '62 Stratocaster",
    });
    expect(r!.brandFormat).toBe('fender_mij_vintage_reissue');
    expect(r!.decodedYear).toBeNull();
  });

  it('S025075 with no MIJ context and pre-1980 listing falls through to USA decoder', () => {
    const r = matchSerial('S025075', 'Fender', {
      listingYear: 1979,
      modelHint: 'Stratocaster',
    });
    expect(r!.brandFormat).toBe('fender_s_prefix');
  });

  it('S025075 with no model_hint at all falls through to USA decoder', () => {
    const r = matchSerial('S025075', 'Fender', { listingYear: 2008 });
    expect(r!.brandFormat).toBe('fender_s_prefix');
  });
});
