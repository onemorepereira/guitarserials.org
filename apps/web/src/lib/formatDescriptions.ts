/**
 * Short human-readable description of each brand_format identifier returned by
 * @guitarserials/core. Keep each to one plain sentence — the guide pages (M3)
 * carry the deeper explanation.
 */
export const FORMAT_DESCRIPTIONS: Record<string, string> = {
  gibson_yddd_yrrr:
    '8-digit YDDDYRRR Gibson USA format (1977–2005) — digits 1+5 encode year, 2-4 encode day of year.',
  gibson_yddd_ybrrr:
    '9-digit YDDDYBRRR Gibson USA format — same year/day encoding as the 8-digit, plus a batch digit.',
  gibson_yy_sequential: '9-digit YYNNNNNNN simplified format used from 2014 to mid-2019.',
  gibson_pre1961:
    'Pre-1961 4-digit factory order number ink-stamped on Junior/Special student models. Year unknown from the serial alone.',
  gibson_pre1977: 'Pre-1977 sequential Gibson serial — no year encoded in the number itself.',
  gibson_1975_1977:
    '1975-1977 Gibson USA 8-digit decal where the first two digits encode the year (99=1975, 00=1976, 06=1977).',
  gibson_lp_classic_1989_1999:
    'Les Paul Classic 1989-1999 ink-stamped short-numeric serial. Year inferred from listing.',
  gibson_lp_classic_2000_2014:
    'Les Paul Classic 2000-2014 format — first two digits encode the year.',
  gibson_cs:
    'Gibson Custom Shop CS-prefix serial. Year snapped to the closest decade via listing context.',
  gibson_cs_yyrrrr:
    'Gibson Custom Shop CSYYRRRR variant — first two digits encode the 2-digit year.',
  gibson_cs_historic:
    'Gibson Custom Shop historic reissue — 5-6 digit sequential, year inferred from listing.',
  gibson_cs_collectors_choice: "Gibson Custom Shop Collector's Choice run (CC<series>A<rank>).",
  gibson_cs_artist: 'Gibson Custom Shop artist/limited-run signature serial.',
  gibson_cs_es_reissue: 'Gibson Custom Shop ES F-hole label reissue (A8/A9 prefix).',
  fender_us_prefix:
    'Fender USA — US + year-digits + sequence. First two post-prefix digits encode the year.',
  fender_mx: 'Fender Mexico — MX + 2-digit year + 6-digit sequence.',
  fender_mn: 'Fender Mexico 1990s — MN + single-digit year + sequence.',
  fender_mz: 'Fender Mexico 2000s — MZ + single-digit year + sequence.',
  fender_dn: 'Fender USA Deluxe 1998-1999 — DN + year-digit + sequence.',
  fender_dz_prefix: 'Fender USA Deluxe 2000s — DZ + year-digit + sequence.',
  fender_s_prefix: 'Fender USA 1970s — S + year-digit + sequence.',
  fender_e_prefix: 'Fender USA 1980s — E + year-digit + sequence.',
  fender_n_prefix: 'Fender USA 1990s — N + year-digit + sequence.',
  fender_z_prefix: 'Fender USA 2000s — Z + year-digit + sequence.',
  fender_avri_v_prefix:
    'Fender American Vintage Reissue (AVRI) — V-prefix. Pre-2012 serials have no year encoded; from mid-2012 onward (AVRI II), the first two digits after V are the 2-digit year.',
  fender_cs: 'Fender Custom Shop — CS-prefix. Year not encoded in the serial.',
  fender_cs_masterbuilt: 'Fender Custom Shop Masterbuilt (HR builder initials + sequence).',
  fender_cs_time_machine: 'Fender Custom Shop Time Machine R-prefix. Year not encoded.',
  fender_cs_american_custom: 'Fender Custom Shop American Custom series (XN prefix).',
  fender_jd: 'Fender Japan 2011+ — JD + 2-digit year + sequence.',
  fender_cz: 'Fender Custom Shop 2000s+ (CZ prefix).',
  fender_vs: 'Fender Vintera / Vintera Special (Mexico) — VS + 2-digit year + sequence.',
  fender_mod_shop: 'Fender Mod Shop (2021+) — MS + 2-digit year + 4-digit sequence.',
  fender_neckplate:
    'Pre-1976 Fender neckplate 8-digit serial — year not encoded in the serial alone.',
  fender_avri_bridge: 'Fender AVRI bridge-plate short-numeric serial. Year inferred from listing.',
  prs_core: 'PRS Core / CE 2008+ — first two digits encode the year (08–29 → 2008–2029).',
  prs_core_pre2008:
    'PRS Core / CE pre-2008 — single-digit year prefix. Decade disambiguation requires the cumulative-production-range table; we leave year undecoded by default.',
  prs_s2:
    'PRS S2 series (2013+) — sequential S2-prefix; year inferrable from cumulative production ranges (not baked into the matcher).',
  prs_ce: 'PRS CE-prefix stamp — uncommon; most CE models carry a standard year-prefix serial.',
  prs_cti: 'PRS Indonesia CTI — the letter after CTI encodes the year (A=2018).',
  prs_ia: 'PRS SE Indonesia IA–IE — letter encodes year (A=2014, B=2015, …, E=2018).',
  prs_se_korea:
    'PRS SE Korea single-letter year (2000–2020) — A=2000, B=2001, …, U=2020. Produced primarily by World Musical Instruments.',
  prs_acoustic: 'PRS Acoustic (2009+) — A + 2-digit year + sequential (e.g. A151234 = 2015).',
  heritage_single: 'Heritage single-letter year code (B=1985 through Z=2009).',
  heritage_double: 'Heritage double-letter year code (AA=2010, AB=2011, ..., AP=2025).',
  heritage_cs: 'Heritage Custom Shop HC-prefix — 1YYXXXX form encodes the year after HC.',
  heritage_standard: 'Heritage standard 1YYXXXX (2020+) — digits 2-3 encode the year.',
  heritage_numeric_6: 'Heritage bare 6-digit Kalamazoo stamp — undocumented format, year unknown.',
  sire_gen1: 'Sire Gen 1 — 8-digit, first two digits encode the year.',
  sire_gen2: 'Sire Gen 2 — 2N + 8 digits, first two post-prefix digits encode the year.',
  ibanez_japan_f:
    'Ibanez Japan (Fujigen) F-prefix. Length distinguishes eras: 6 digits = 1987-1996 single-Y, 7-8 digits = 1997+ YY.',
  ibanez_japan_letter_month:
    'Ibanez Japan pre-F (1975-1988) letter-month format: month letter + 2-digit year + sequence.',
  ibanez_indonesia: 'Ibanez Indonesia I-prefix — year not encoded in the serial.',
  ibanez_korea: 'Ibanez Korea C-prefix — year not encoded in the serial.',
};

export function describeFormat(formatId: string): string {
  return FORMAT_DESCRIPTIONS[formatId] ?? 'Known serial format for this brand.';
}
