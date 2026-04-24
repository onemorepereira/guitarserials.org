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
  gibson_a_series:
    "Gibson A-series hollowbody label (1947–1961). A + 3–5 digits; year decoded via Gibson's official serialization range table. A-1 through A-18750 = white label; A-20001 through A-36147 = orange label.",
  gibson_fon_letter:
    'Gibson FON letter-prefix (1952–1961). Q/R/S/T/U/V/W/X/Y/Z + digits, stamped inside the instrument. Letter pins the year directly (Z=1952, Y=1953, … Q=1961).',
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
    '8-digit bare numeric on a Fender neckplate — rare; most often a US-prefix serial with US dropped. Year not encoded.',
  fender_pre1976_neckplate:
    'Fender neckplate pre-1976 (4-6 digit bare numeric). Year ranges overlap heavily across 1954-1976; use neck-date and pot-codes to pin the year.',
  fender_l_series:
    'Fender L-series (1963-1965) — L + 5 digits neckplate. The L was reportedly a mistake originally meant to be a 1 for the 100,000 range.',
  fender_japan_jv:
    'Fender Japan Vintage JV (1982-1984) — JV + 5-6 digits. Made for the export market starting with the 52/57/62 reissues.',
  fender_japan_sq: 'Fender Japan Squier SQ (1983-1984) — SQ + 5-6 digits. Companion to JV.',
  fender_avri_bridge: 'Fender AVRI bridge-plate short-numeric serial. Year inferred from listing.',
  prs_core: 'PRS Core / CE 2008+ — first two digits encode the year (08–29 → 2008–2029).',
  prs_core_pre2008:
    "PRS Core set-neck pre-2008 — single-digit year prefix + sequential. Year decoded via PRS's official set-neck cumulative-range table (1985–2024).",
  prs_s2:
    'PRS S2 series (2013+) — S2-prefix + sequential. Year decoded via the official per-year S2 range table (2013–2024).',
  prs_ce:
    'PRS CE-prefix — decoded via PRS\'s official CE range table (1988–2008). Pre-1998 CE serials also appear with a single-digit "7" prefix and require a model hint to disambiguate from Core.',
  prs_swamp_ash:
    'PRS Swamp Ash Special — SA-prefix (1998+) or single-digit "8" prefix (1997–1998, model-hint gated). Year decoded via PRS\'s official Swamp Ash range table.',
  prs_eg:
    'PRS EG models (1990–1995) — single-digit "5" prefix + sequential. Year decoded via PRS\'s official EG range table; requires a model hint to disambiguate from Core.',
  prs_bass_bolt_on:
    'PRS Bolt-On Bass (1989–1991) — single-digit "4" prefix + sequential, model-hint gated. Year decoded via PRS\'s official bolt-on bass table.',
  prs_bass_set_neck:
    'PRS Set-Neck Bass (1986–1991) — single-digit "9" prefix + sequential, model-hint gated. Year decoded via PRS\'s official set-neck bass table.',
  prs_bass_electric:
    "PRS Electric Bass (2000–2004) — EB-prefix + sequential. Year decoded via PRS's official Electric Bass range table.",
  prs_cti: 'PRS Indonesia CTI — the letter after CTI encodes the year (A=2018).',
  prs_ia: 'PRS SE Indonesia IA–IE — letter encodes year (A=2014, B=2015, …, E=2018).',
  prs_se_korea:
    'PRS SE Korea single-letter year (2000–2022) — A=2000, B=2001, …, U=2020, V=2021, W=2022. Produced primarily by World Musical Instruments.',
  prs_acoustic: 'PRS Acoustic (2009+) — A + 2-digit year + sequential (e.g. A151234 = 2015).',
  heritage_single:
    'Heritage single-letter year code (B=1985 through Y=2008). Heritage skipped Z entirely; 2009 instruments used the 1YYXXXX standard-collection format.',
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
  ibanez_indonesia:
    'Ibanez Indonesia I-prefix (Cor-Tek). 9-digit layout encodes YY + MM + 5-digit sequence; shorter variants leave year unknown.',
  ibanez_indonesia_kwo_hsiao:
    'Ibanez Indonesia K-prefix (Kwo Hsiao Co., Ltd.). Same 9-digit YY + MM + 5-digit layout as the I-prefix Cor-Tek format.',
  ibanez_indonesia_samick:
    'Ibanez Indonesia SI-prefix (Samick). 7-digit YMMPPPP (2000s single-digit year) or 9-digit YYMMPPPPP layout.',
  ibanez_korea:
    'Ibanez Korea C-prefix (Cort). 8-digit YY+MM+PPPP decodes 2-digit year; 7-digit YMMPPPP decodes 1990s single-digit year; 6-digit leaves year unknown.',
  ibanez_korea_samick:
    'Ibanez Korea S-prefix (Samick, 1990–1995). S + Y + MM + 4-digit sequence; Y is last digit of year.',
  ibanez_korea_world:
    'Ibanez Korea W-prefix (World Musical Instrument Co.). W + YY + M + RRRR; M is month (1-9, X=Oct, Y=Nov, Z=Dec).',
  gretsch_modern:
    'Gretsch modern (2003+) — 2-letter factory code (JT/JD/JF/KP/KS/CY/CS) + YY + MM + 4-digit sequence.',
  gretsch_date_coded_1966_1972:
    'Gretsch date-coded (1966-1972) — first digit(s) = month, next digit = year (6-9 → 1966-1969, 0-2 → 1970-1972), remaining digits = production rank.',
  gretsch_pre1966_sequential:
    "Gretsch pre-1966 sequential (1939-1965) — 3-5 digit rising sequence. Year ranges overlap so the serial alone doesn't pin the year; use listing context and physical features.",
  rickenbacker_1961_1986:
    'Rickenbacker (1961-1986) — year letter A-Z (A=1961, Z=1986) + month letter A-L + 3-5 digit production number.',
  rickenbacker_pre1961:
    'Rickenbacker pre-1961 — model letter (B=bass, C=combo, M=mandolin, G=guitar) + year digit 4-9 (1954-1959) + production number.',
  rickenbacker_1960_jk_jl: 'Rickenbacker 1960 transition — JK = November 1960, JL = December 1960.',
  rickenbacker_1987_1996:
    'Rickenbacker (1987-1996) — month letter A-L + year digit 0-9 (1987-1996) + production number.',
  rickenbacker_1996_plus:
    'Rickenbacker (1996+) — month letter M-Y (O skipped) + year digit 0-9 + production number. Year digit cycles every decade; needs listing-year context past 2006.',
  jackson_modern_import:
    'Jackson modern import (2013+) — 3-letter factory code + YY + 5-digit sequence. Codes: ICJ/ISJ/IWJ (Indonesia), CYJ/CJ/CUJ/CNJ/CSJ (China), NHJ (India), KCJ/KWJ/KSJ (Korea), MJ/XJ (Mexico, 2-letter).',
  jackson_rr_signature: 'Jackson Randy Rhoads signature — RR + 4-digit sequence; no year encoded.',
  jackson_usa: 'Jackson USA J-prefix — J + 4-digit sequence; no year encoded.',
  jackson_mij_professional:
    'Jackson MIJ Professional (1990-1995) — 6 digits; first digit = year offset (0=1990, 5=1995).',
  jackson_mij_1996_plus:
    'Jackson MIJ bolt-on (1996+) — 7 digits; first two digits are the 2-digit year.',
  jackson_mii_india:
    'Jackson MII India (JS20 series) — 8 digits; first two digits are the 2-digit year.',
  charvel_japan: 'Charvel Japan (modern) — JC + YY + 5-6 digit sequence.',
  charvel_san_dimas:
    'Charvel USA San Dimas (1981-1986) — 4-digit sequential; cumulative-range lookup needed for exact year.',
  charvel_usa_promod:
    'Charvel USA Pro-Mod (2004+) — 6-digit neckplate serial. Year not encoded; contact Charvel/Fender for the build date.',
  epiphone_factory:
    'Epiphone 1993-2008 — factory code (1-2 letters: S/U/P/R/I/F/T/Z/K/O/J/SI/CI/EE/EA/DW/MC/SJ/UC/FN/SM/…) + YY + MM + 4-digit rank.',
  epiphone_numeric: 'Epiphone 2008+ — 10-digit all-numeric: YY + MM + 6-digit rank.',
  squier_ics: 'Squier ICS — Indonesia Cort, 2009+. ICS + YY + 4-6 digit seq.',
  squier_iss: 'Squier ISS — Indonesia Samick. ISS + YY + 4-6 digit seq.',
  squier_cgs: 'Squier CGS — China Guangzhou (Classic Vibe). CGS + YY + 4-6 digit seq.',
  squier_cn: 'Squier CN — China Cor-Tek. CN + YY + 4-6 digit seq.',
  squier_cy: 'Squier CY — China CW. CY + YY + 4-6 digit seq.',
  squier_ic: 'Squier IC — Indonesia Cort (shorter prefix). IC + YY + 4-6 digit seq.',
  squier_si: 'Squier SI — Samick Indonesia. SI + YY + 4-6 digit seq.',
  squier_kc: 'Squier KC — Korea Cor-Tek (1997+). KC + YY + 4-6 digit seq.',
  squier_kv: 'Squier KV — Korea Saehan/Sunghan (1997+). KV + YY + 4-6 digit seq.',
  squier_vn: 'Squier VN — Vietnam (2000s+). VN + YY + 4-6 digit seq.',
  squier_mn: 'Squier MN — Mexico 1990s. MN + single-digit year + 4-6 seq.',
  squier_mz: 'Squier MZ — Mexico 2000s. MZ + single-digit year + 4-6 seq.',
  squier_usa_e: 'Squier E-prefix — USA 1980s. E + single-digit year + 4-5 seq.',
  squier_usa_n: 'Squier N-prefix — USA 1990s. N + single-digit year + 4-5 seq.',
  gandl_clf_dated: 'G&L CLF 1998-2011 — CLF + YY + MM + 3-digit rank; year and month encoded.',
  gandl_clf_cumulative: 'G&L CLF 2011+ — CLF + 6-digit cumulative sequence; no year encoded.',
  gandl_cl_transitional: 'G&L CL 1997-1998 — transitional pre-CLF prefix with 5-digit sequence.',
  gandl_g_prefix: 'G&L G-prefix (1980-1997) — guitars, 5-6 digit sequence, no year encoded.',
  gandl_b_prefix: 'G&L B-prefix (1980-1997) — basses, 5-6 digit sequence, no year encoded.',
  gandl_placentia: 'G&L Placentia Series (China) — full 4-digit year prefix + 4-digit sequence.',
  gandl_tribute_china: 'G&L Tribute China — L + YY + MM + 4-5 digit sequence.',
  gandl_tribute_indonesia: 'G&L Tribute Indonesia — 9 digits (YY + MM + 5-digit sequence).',
  gandl_tribute_korea: 'G&L Tribute Korea — 8 digits (YY + MM + 4-digit sequence).',
  schecter_factory: 'Schecter factory-prefix — W/IW/IC/C/S + YY + 3-7 digit sequence.',
  schecter_numeric: 'Schecter no-prefix — YY + 4-6 digit sequence (older Schecter).',
  martin_sequential:
    "Martin sequential (1898+). Year decoded via binary search of Martin's official year-end cumulative chart.",
  esp_import:
    'ESP / LTD import — letter factory prefix (E/U Korea, L China, I Vietnam, IS/IR/IW/IX Indonesia) + 7-8 digits. Year not uniformly encoded.',
  esp_world_korea: 'ESP / LTD W-prefix — World Musical Instrument Co. (Incheon, Korea) + 8 digits.',
  esp_pre2000_japan:
    'ESP pre-2000 Japan — 8-digit DDMMYNNN (day + month + year-digit + 3-digit rank). Year snapped via listingYear (candidates 1975-1999).',
  musicman_b_prefix:
    'Music Man B-prefix. B + 6 digits; year not encoded in serial — use EB database.',
  musicman_f_prefix: 'Music Man F-prefix. F + 5 digits.',
  musicman_5digit:
    'Music Man 5-digit (1985+). 8xxxx = EVH/Axis line, 9xxxx = Morse/Luke/Silhouette.',
};

export function describeFormat(formatId: string): string {
  return FORMAT_DESCRIPTIONS[formatId] ?? 'Known serial format for this brand.';
}
