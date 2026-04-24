export type SourceKind = 'manufacturer' | 'reference' | 'community' | 'book';

export interface Source {
  label: string;
  url: string;
  kind: SourceKind;
  /** One-line note about what this source covers. */
  note?: string;
}

export interface BrandFormat {
  /** Matches `brandFormat` returned by @guitarserials/core. */
  id: string;
  /** Human-readable format name. */
  name: string;
  /** Year range this format was used. */
  yearRange: string;
  /** Example serial that decodes under this format. */
  example: string;
  /** Optional listing year / model hint for the example's permalink. */
  exampleYear?: number;
  exampleModelHint?: string;
  /** How the decode works. Plain prose, 1–3 sentences. */
  rule: string;
  /** Caveats, collisions, known misses. */
  gotchas?: string[];
  /**
   * Optional format-specific citations. Used when the rule needs a stronger
   * citation than the brand-wide `sources` (e.g. a format with a contested
   * or non-obvious decoding rule). When empty, the brand-level sources apply.
   */
  sources?: Source[];
  /**
   * Optional era label for grouping. Brands with many formats (Gibson,
   * Fender, Squier, G&L…) are easier to scan when related formats cluster.
   * Brands with a handful of formats can omit this and render flat.
   */
  era?: string;
  /**
   * Primary formats cover the bulk of real-world serials a user is likely
   * to see today; they render prominently. Non-primary formats (vintage,
   * edge cases) tuck into a "Less common variants" disclosure so the
   * common path stays scannable.
   */
  primary?: boolean;
}

export interface SerialLocation {
  place: string;
  description: string;
}

export interface BrandGuide {
  id: string;
  slug: string;
  intro: string;
  eraPara?: string;
  /**
   * Brand-level authoritative citations — apply to every format in this
   * brand unless a format overrides via its own `sources`.
   */
  sources: Source[];
  formats: BrandFormat[];
  findSerial: {
    intro: string;
    locations: SerialLocation[];
  };
  /**
   * Optional note on source quality — surfaced to readers when a brand has
   * no official decoder (Ibanez, Sire).
   */
  sourceNote?: string;
}

export const BRAND_GUIDES: Record<string, BrandGuide> = {
  gibson: {
    id: 'gibson',
    slug: 'gibson',
    intro:
      'Gibson has used at least a dozen distinct serialization schemes since 1902 — paper labels, interior-stamped factory order numbers with year letters, A-prefix hollowbody labels, 4-6 digit die-stamps, 8-digit YDDDYRRR, 9-digit YDDDYBRRR, and a simplified 9-digit YYNNNNNNN format. No single rule decodes them all. The decoder matches the format first, then decodes the year when the serial actually encodes one.',
    eraPara:
      'Era map: 1902-1947 paper labels (sequential). 1947-1961 A-prefix hollowbody labels (year from range table). 1952-1961 FON letter-prefix interior stamps (Q-Z = 1961-1952). 1961-1970 die-stamped 4-6 digit peghead (no "Made in USA", year ambiguous across reuse). 1970-1975 die-stamped 6-digit with "Made in USA" (still ambiguous). 1975-1977 8-digit decals (99=1975, 00=1976, 06=1977). 1977-2005 8-digit YDDDYRRR (year = pos 1+5, day-of-year = pos 2-4). 2005-2014 and mid-2019+ 9-digit YDDDYBRRR (+ batch digit). 2014-mid-2019 simplified YYNNNNNNN. Custom Shop, artist runs, Les Paul Classic, Centennial, and student-line FONs each have their own conventions.',
    sources: [
      {
        label: 'Gibson Serial Number Search',
        url: 'https://www.gibson.com/pages/serial-number-search',
        kind: 'manufacturer',
        note: "Gibson's official serial lookup and dating reference; documents the 1975-1977 decal, the 8-digit YDDDYRRR format (1977+), and the 9-digit YDDDYBRRR format (July 2005+).",
      },
      {
        label: 'The Vintage Guitar Info Guy — Gibson Dating',
        url: 'https://guitarhq.com/gibson.html',
        kind: 'reference',
        note: 'Comprehensive reference maintained since 1995 covering paper-label era, A-series (1947-1961), ink-stamped peghead, 1961-1975 impressed, and modern formats.',
      },
    ],
    formats: [
      {
        id: 'gibson_yddd_yrrr',
        name: '8-digit YDDDYRRR (1977–2005)',
        yearRange: '1977–2005',
        example: '82765501',
        rule: 'Positions 1 and 5 (1-indexed) together are the last two digits of the year. Positions 2–4 are the day of year (001–366). Positions 6–8 are the rank for that day.',
        gotchas: [
          'Day of year must be 001–366; values outside that range mean the number is not a Gibson 8-digit serial.',
          'Year 40 and above decodes to 19YY (legacy); years 00–39 decode to 20YY.',
        ],
      },
      {
        id: 'gibson_yddd_ybrrr',
        name: '9-digit YDDDYBRRR (2005–2014, mid-2019+)',
        yearRange: '2005–2014, mid-2019+',
        example: '821654501',
        rule: 'Same year/day encoding as the 8-digit format (positions 1+5 = year, 2–4 = day of year), with a batch digit at position 6 and a 3-digit rank at 7–9.',
        gotchas: [
          'Structurally overlaps the YYNNNNNNN simplified format for a small set of inputs; we emit both valid interpretations and pick the closer one when a listing year is provided.',
        ],
      },
      {
        id: 'gibson_yy_sequential',
        name: '9-digit YYNNNNNNN simplified (2014–mid-2019)',
        yearRange: '2014–mid-2019',
        example: '150000123',
        rule: 'The first two digits are the 2-digit year (14–19 only). The remaining seven are a plain sequential rank.',
        gotchas: [
          'Only valid for years 14–19. Outside that window the serial is something else.',
          'Structurally disjoint from YDDDYBRRR in practice: if YY is 14–19, position 1 is 4–9, which forces DDD ≥ 400 (invalid day-of-year).',
        ],
      },
      {
        id: 'gibson_pre1977',
        name: 'Pre-1977 sequential (4–7 digits)',
        yearRange: 'Pre-1977',
        example: '1234567',
        rule: 'Sequential serial with no year encoded in the digits. Covers three distinct sub-eras: 1961-1969 die-stamped with no "Made in USA" (4-6 digit, highly ambiguous — same number reused across years), 1970-1975 die-stamped 6-digit with "Made in USA" stamp below (also ambiguous), and some 1961-1969 student-line 4-digit stamps. Dating requires cross-referencing Gibson\'s year-range charts with features (pot codes, hardware, finish, neck date).',
        gotchas: [
          'Same serial number was sometimes reused up to three times between 1961 and 1969.',
          'For pre-1970 vs 1970-1975 disambiguation, the presence/absence of a "Made in USA" stamp below the serial is the primary tell.',
        ],
      },
      {
        id: 'gibson_a_series',
        name: 'A-series hollowbody label (1947–1961)',
        yearRange: '1947–1961',
        example: 'A18000',
        rule: "A + 3-5 digit number on a label inside the F-hole. Used exclusively on mid-to-upper-end hollowbody instruments. White label from A-100 (1947) through A-18750 (Jan 12, 1955); orange label from A-20001 (Jan 13, 1955) through A-36147 (1961, the final A-series serial). Year decoded via Gibson's official serialization range chart.",
        gotchas: [
          'Serials between A-18751 and A-20000 were reserved / unused during the label-color transition.',
          'Only used on hollowbodies — solidbodies of this era used FON letter-prefix interior stamps or pre-1961 headstock stamps.',
        ],
      },
      {
        id: 'gibson_fon_letter',
        name: 'FON letter-prefix (1952–1961)',
        yearRange: '1952–1961',
        example: 'Z22301',
        rule: 'Factory Order Number stamped INSIDE the instrument (not on the headstock). Format is a letter (Q-Z) + batch number (3-5 digits) + optional rank. The letter pins the year directly: Z=1952, Y=1953, X=1954, W=1955, V=1956, U=1957, T=1958, S=1959, R=1960, Q=1961. Gibson worked backwards through the alphabet, ending the FON system in 1961 when the die-stamped serial-number system took over.',
        gotchas: [
          "FONs are interior stamps — you'll find them inside the control cavity or on the inside of the body, not on the headstock.",
          'The FON and the headstock serial number are separate things; a 1958 Les Paul has both a T-prefix FON (inside) and a 4-6 digit headstock serial.',
        ],
      },
      {
        id: 'gibson_pre1961',
        name: 'Late-1958+ 4-digit short serial (Junior/Special/Melody Maker)',
        yearRange: '1958–1960',
        example: '6370',
        exampleModelHint: 'Les Paul Junior',
        rule: 'A 4-digit impressed or inked headstock serial used on some Junior/Special/Melody Maker student-line models from the fall of 1958 onward — an exception to the standard era numbering. Not to be confused with the Factory Order Number (FON), which was stamped inside the instrument and used a different layout.',
        gotchas: [
          'Only claimed when the model hint indicates a Junior/Special/Melody Maker model — a bare 4-digit number without that hint falls through to the generic pre-1977 format.',
          'Rejects marketing phrases like "Special Edition" or artist names like "Junior Brown".',
          'The serial itself encodes no year; confidence is capped at medium.',
        ],
      },
      {
        id: 'gibson_1975_1977',
        name: '1975–1977 8-digit decal',
        yearRange: '1975–1977',
        example: '99123456',
        exampleYear: 1975,
        rule: 'The first two digits encode the year: 99 = 1975, 00 = 1976, 06 = 1977. The remaining six are sequential.',
        gotchas: [
          'Overlaps the generic YDDDYRRR format for 00-prefixed serials. Only prefers this decoding when a listing year is in the 1973–1979 range.',
        ],
      },
      {
        id: 'gibson_lp_classic_1989_1999',
        name: 'Les Paul Classic ink-stamped (1989–1999)',
        yearRange: '1989–1999',
        example: '04759',
        exampleYear: 1995,
        exampleModelHint: 'Les Paul Classic',
        rule: 'Short-numeric (4–6 digit) serial ink-stamped on the back of the headstock on Les Paul Classic models of this era. The serial itself carries no year; dating uses the listing year as context.',
        gotchas: [
          'Only claimed when the model hint clearly denotes a Les Paul Classic. Rejects false positives like "SG Standard Classic White" (color) or "ES-175 Classic" (different instrument).',
        ],
      },
      {
        id: 'gibson_lp_classic_2000_2014',
        name: 'Les Paul Classic YY-prefix (2000–2014)',
        yearRange: '2000–2014',
        example: '054438',
        exampleYear: 2005,
        exampleModelHint: 'Les Paul Classic',
        rule: 'Six-digit format where the first two digits are the last two digits of the year and the remaining four are sequential.',
      },
    ],
    findSerial: {
      intro:
        'On most Gibson models the serial is impressed (or ink-stamped on very early models) on the back of the headstock. Some Custom Shop models and certain hollowbody models use different locations — see the find-locations below.',
      locations: [
        {
          place: 'Back of headstock (solid-body standard)',
          description:
            'The primary location for most Les Paul, SG, and Explorer models from 1977 onward. The serial is impressed into the wood through the finish.',
        },
        {
          place: 'F-hole paper label (hollowbody / semi-hollow)',
          description:
            'On ES-series and other hollowbody instruments the serial often appears on a paper label visible through the treble-side F-hole. A corresponding inked or impressed serial is usually also on the headstock.',
        },
        {
          place: 'Back of headstock — inked (pre-1961 student line)',
          description:
            'Junior, Special, and Melody Maker models pre-1961 have a 4-digit factory order number ink-stamped rather than impressed.',
        },
      ],
    },
  },

  'gibson custom shop': {
    id: 'gibson custom shop',
    slug: 'gibson-custom-shop',
    intro:
      'Gibson Custom Shop (CS) has its own serial formats that diverge from Gibson USA. The CS label launched in 1993 and has produced a steady stream of Historic Reissue Les Pauls, Murphy Lab aged models, artist signature runs, and short-run collectibles. Each of these uses a distinct serial scheme.',
    sources: [
      {
        label: 'Gibson Serial Number Search',
        url: 'https://www.gibson.com/pages/serial-number-search',
        kind: 'manufacturer',
        note: 'Official Gibson lookup tool; covers Custom Shop alongside USA formats.',
      },
      {
        label: 'Lovies Guitars — Gibson Serial Number Identification & Dating',
        url: 'https://loviesguitars.com/gibson-serial-number-identification-dating/',
        kind: 'reference',
        note: 'Dealer reference documenting the CSYXXXX format (CS + single year digit + sequential rank) and its decade-ambiguity caveat.',
      },
      {
        label: 'Gibson Brands Forum — 6-digit CS serial numbers',
        url: 'https://forum.gibson.com/topic/83891-6-digit-cs-serial-numbers/',
        kind: 'community',
        note: 'Community thread documenting the ambiguous 6-digit CS variants (CSYRRRRR single-Y vs CSYYRRRR double-Y).',
      },
    ],
    formats: [
      {
        id: 'gibson_cs',
        name: 'CS-prefix (CSYRRRR)',
        yearRange: '1993+',
        example: 'CS10845',
        exampleYear: 2001,
        rule: 'The first post-CS digit encodes the year within its decade (1 could mean 1991, 2001, 2011, or 2021). The closest valid year ≥ 1993 is chosen using the listing year as context.',
        gotchas: [
          'Without a listing year, the year is reported as unknown rather than guessed — the site will note that 4 decades are plausible.',
        ],
      },
      {
        id: 'gibson_cs_yyrrrr',
        name: 'CSYYRRRR (6-digit, year in first 2)',
        yearRange: '1993–2029',
        example: 'CS202150',
        exampleYear: 2020,
        rule: 'A 6-digit variant where the first two digits are the 2-digit year and the remaining four are the sequential rank.',
        gotchas: [
          'Ambiguous with the single-Y interpretation for some 6-digit CS serials — both interpretations are emitted and the closer to the listing year wins.',
        ],
      },
      {
        id: 'gibson_cs_historic',
        name: 'Historic Reissue (5–6 digit numeric)',
        yearRange: '1993+',
        example: '991234',
        exampleYear: 1999,
        exampleModelHint: 'Les Paul Standard R9 Historic',
        rule: 'Pure 5- or 6-digit sequential numbers on Historic Reissue / R-series / Murphy Lab Les Pauls. Format is MYRRR(R) where M is the model-year digit (0 = R0/1960, 4 = R4/1954, 7 = R7/1957, 8 = R8/1958, 9 = R9/1959) and Y is the last digit of the build year. When M matches a documented R-series model digit the decoder snaps Y to the closest CS production decade using the listing year (Custom Shop launched 1993). When M is not an R-series digit we match the format but leave year null (other CS historic lines use different first-digit conventions). Requires a listing year and a model hint (Reissue, R0/R4/R7/R8/R9, Historic, Murphy Lab, or Custom Shop) to claim.',
        gotchas: [
          'The build year is decoded only when the first digit is 0/4/7/8/9 — other first digits match the format but leave year null.',
          'The year-digit is ambiguous across decades. Without a listing year the decoder has no way to pick between 1999, 2009, 2019, and 2029 for R9 991234 — listing context is required.',
        ],
      },
      {
        id: 'gibson_cs_collectors_choice',
        name: "Collector's Choice",
        yearRange: 'Any',
        example: 'CC34A103',
        rule: "CC followed by the series number, the letter A, and the unit rank within the series (e.g. CC34A103 = Collector's Choice #34, unit 103).",
      },
      {
        id: 'gibson_cs_artist',
        name: 'Artist / limited-edition runs',
        yearRange: 'Any',
        example: 'JP1234',
        rule: 'Each signature or limited run issues its own letter prefix followed by a sequential rank. Recognized prefixes include JP/JPP (Jimmy Page), AFD (Appetite For Destruction), ACE (Ace Frehley), ANACONDA (Slash), JCW (Jerry Cantrell Wylde), JOEB (Joe Bonamassa), PT (Pete Townshend), RG (Robot Guitar), SL / SLASH58V (Slash), and others.',
        gotchas: [
          'The year is not encoded in any of these — the prefix alone is definitive, so we mark confidence as high regardless of listing year.',
        ],
      },
      {
        id: 'gibson_cs_es_reissue',
        name: 'ES F-hole label (A8/A9 prefix)',
        yearRange: 'Any',
        example: 'A80001',
        rule: "A followed by 8 or 9, then 4–5 digits. The 8 or 9 identifies the reissue model year (A8 = '58, A9 = '59); the following digits are year + rank, but the label does not reliably encode current production year.",
      },
    ],
    findSerial: {
      intro:
        "Custom Shop serials are usually impressed on the back of the headstock. Some Historic models also carry an additional interior label or a truss-rod-cavity stamp. Collector's Choice and artist-run models typically have a separate COA with the full provenance.",
      locations: [
        {
          place: 'Back of headstock',
          description:
            'The primary location for CS-prefix, Historic Reissue, and artist-run models. Usually impressed through the finish.',
        },
        {
          place: 'Control-cavity / truss-rod area',
          description:
            'Historic Reissues often have a secondary stamp or label inside the control cavity that matches the headstock serial.',
        },
        {
          place: 'Certificate of Authenticity (COA)',
          description:
            "Artist runs, Collector's Choice, and Murphy Lab instruments ship with a COA noting the serial, build date, and (for artist runs) unit number within the run.",
        },
      ],
    },
  },

  fender: {
    id: 'fender',
    slug: 'fender',
    intro:
      'Fender has used more serial formats than any other major guitar brand — across four eras of USA production and contract manufacturing in Mexico, Japan, Korea, China, and Indonesia. The quick shorthand: pre-1976 USA was on a neckplate (4-6 digit numeric or L-prefix for 1963-1965). Post-1976 USA uses a decade-prefix letter (S=1970s, E=1980s, N=1990s, Z=2000s, DZ=2000s Deluxe, US+YY=2000+). Mexico introduced MN (1990s), MZ (2000s), MX (2009+), and VS (Vintera). Japan started with JV/SQ export reissues in 1982-1984, then letter-coded MIJ through 1997, then Crafted-in-Japan, then JD (2011+). Custom Shop has its own zoo of definitive prefixes: V (AVRI), CS, CZ, R (Time Machine), XN (American Custom), HR (Masterbuilt).',
    eraPara:
      "Era map in more detail: Pre-1954 = 4-digit neckplate (rare). 1954-1963 = 4-5 digit neckplate (ranges overlap across years). 1963-1965 = L + 5 digits (originally meant to be a '1' for the 100k range). 1965-1976 = 6-digit on an F-plate (pre-numbered plates used as available, so ranges overlap). 1976+ = decade-prefix era (S/E/N/Z/DZ). 1982-1984 = Japan JV / SQ export. 1984-1997 = Japan letter-coded MIJ (E1-E9, N0-N6). 1997-2008 = Japan Crafted-in-Japan (various prefixes). 2000+ = US-prefix USA. 2009+ = MX-prefix Mexico. 2011+ = JD-prefix Japan. 2020+ = VS Vintera. 2021+ = MS Mod Shop. Custom Shop formats (V/CS/CZ/R/XN/HR) run concurrently with main production.",
    sources: [
      {
        label: 'Fender — How can I find out when my American-made instrument was manufactured?',
        url: 'https://support.fender.com/hc/en-us/articles/42521696369947-How-can-I-find-out-when-my-American-made-instrument-was-manufactured',
        kind: 'manufacturer',
        note: "Fender's official support article covering USA decade-prefix (S/E/N/Z/DZ), V-prefix AVRI, CS prefix, and US + YY prefix (2000+).",
      },
      {
        label: 'Fender — How can I find out when my Mexican-made instrument was manufactured?',
        url: 'https://support.fender.com/hc/en-us/articles/42521694811931-How-can-I-find-out-when-my-Mexican-made-instrument-was-manufactured',
        kind: 'manufacturer',
        note: 'Official coverage of MN (1990s), MZ (2000s), MX (2009+), and VS Vintera prefixes.',
      },
      {
        label: 'Fender — How can I find out when my Japanese-made instrument was manufactured?',
        url: 'https://support.fender.com/hc/en-us/articles/42521710053275-How-can-I-find-out-when-my-Japanese-made-instrument-was-manufactured',
        kind: 'manufacturer',
        note: 'Official coverage of the JD prefix (2011+ Japan) and earlier Made-in-Japan serials.',
      },
      {
        label: 'Fender Serial Number Lookup Tool',
        url: 'https://serialnumberlookup.fender.com/',
        kind: 'manufacturer',
        note: "Fender's official lookup tool — enter a serial and it returns the decoded model and approximate year when known.",
      },
      {
        label: 'Gear Genealogy: How to Date Your Guitar',
        url: 'https://www.fender.com/articles/maintenance/gear-genealogy-how-to-date-your-guitar',
        kind: 'manufacturer',
        note: "Fender's published overview of its serial-numbering systems across factories and eras.",
      },
    ],
    formats: [
      {
        id: 'fender_us_prefix',
        name: 'US-prefix (USA, 2000+)',
        yearRange: '2000+',
        example: 'US24002164',
        rule: 'US followed by 6–9 digits, with an optional single-letter rework suffix. The first two post-prefix digits are the 2-digit year.',
      },
      {
        id: 'fender_mx',
        name: 'MX-prefix (Mexico, 2009+)',
        yearRange: '2009+',
        example: 'MX18123456',
        rule: 'MX + 8 digits + optional single-letter rework suffix. The first two post-prefix digits are the 2-digit year.',
      },
      {
        id: 'fender_mn',
        name: 'MN-prefix (Mexico, 1990s)',
        yearRange: '1990s',
        example: 'MN412345',
        rule: 'MN followed by a single year digit (0–9 → 1990–1999) and a 4–6 digit sequence.',
      },
      {
        id: 'fender_mz',
        name: 'MZ-prefix (Mexico, 2000s)',
        yearRange: '2000s',
        example: 'MZ5123456',
        rule: 'MZ followed by a single year digit (0–9 → 2000–2009) and a 4–6 digit sequence.',
      },
      {
        id: 'fender_dn',
        name: 'DN-prefix (USA Deluxe, 1998–1999)',
        yearRange: '1998–1999',
        example: 'DN8123456',
        rule: 'DN + single year digit + 4–5 digit sequence. Matched before the bare D-prefix so the two-letter form wins.',
      },
      {
        id: 'fender_dz_prefix',
        name: 'DZ-prefix (USA Deluxe, 2000s)',
        yearRange: '2000s',
        example: 'DZ5123456',
        rule: 'DZ + single year digit + 4–6 digit sequence.',
      },
      {
        id: 'fender_s_prefix',
        name: 'S-prefix (USA, 1970s)',
        yearRange: '1976–1979',
        example: 'S712345',
        rule: 'S + single year digit + 4–6 digit sequence. Used on the post-1976 decade-prefix headstock decals.',
      },
      {
        id: 'fender_e_prefix',
        name: 'E-prefix (USA, 1980s)',
        yearRange: '1980s',
        example: 'E312345',
        rule: 'E + single year digit + 4–6 digit sequence.',
      },
      {
        id: 'fender_n_prefix',
        name: 'N-prefix (USA, 1990s)',
        yearRange: '1990s',
        example: 'N8357086',
        rule: 'N + single year digit + 4–6 digit sequence.',
      },
      {
        id: 'fender_z_prefix',
        name: 'Z-prefix (USA, 2000s)',
        yearRange: '2000s',
        example: 'Z2218688',
        rule: 'Z + single year digit + 4–6 digit sequence.',
      },
      {
        id: 'fender_avri_v_prefix',
        name: 'V-prefix (AVRI, American Vintage Reissue)',
        yearRange: '1982+',
        example: 'V1612345',
        rule: 'V + 4–7 digits. Two sub-eras: pre-2012 V-prefix (original AVRI line, 4–7 digits) has no year encoded and must be dated via pot codes / listing context. From mid-2012 onward (AVRI II era), V + 7 digits encodes the 2-digit year in the first two post-prefix digits (e.g. V1612345 = 2016). The decoder applies a plausibility gate of 12–29 on the leading pair; lengths or leading pairs outside that gate fall back to no-year.',
        gotchas: [
          'A 7-digit V-prefix serial with leading digits like 08 or 09 is NOT a 2008/2009 AVRI II — those leading pairs are outside the AVRI II era. The decoder correctly leaves year null in that case.',
        ],
      },
      {
        id: 'fender_cs',
        name: 'CS-prefix (Custom Shop)',
        yearRange: 'Any',
        example: 'CS123456',
        rule: 'Fender Custom Shop 5–6 digit serials. No year encoded.',
      },
      {
        id: 'fender_cs_masterbuilt',
        name: 'HR-prefix (Custom Shop Masterbuilt)',
        yearRange: 'Any',
        example: 'HR12345',
        rule: 'HR + 5–6 digit sequence. Used on Custom Shop Masterbuilt instruments; "HR" is the builder-initials convention the Custom Shop uses for select masterbuilt runs. No year encoded in the serial — the masterbuilt certificate of authenticity is the primary dating document.',
      },
      {
        id: 'fender_cz',
        name: 'CZ-prefix (Custom Shop, 2000s+)',
        yearRange: '2000s+',
        example: 'CZ123456',
        rule: 'CZ + 5–6 digit sequence. Custom Shop prefix introduced in the 2000s; predecessor to the XN American Custom prefix. No year encoded in the serial — use the COA.',
      },
      {
        id: 'fender_vs',
        name: 'VS-prefix (Vintera / Vintera Special, 2020s+)',
        yearRange: '2020s+',
        example: 'VS220123',
        rule: 'VS + 6 digits with YY + 4-digit sequence.',
      },
      {
        id: 'fender_jd',
        name: 'JD-prefix (Japan, 2011+)',
        yearRange: '2011+',
        example: 'JD15123456',
        rule: 'JD + 8 digits with YY + 6-digit sequence.',
      },
      {
        id: 'fender_mod_shop',
        name: 'MS-prefix (Mod Shop, 2021+)',
        yearRange: '2021+',
        example: 'MS233158',
        rule: 'MS + 2-digit year + 4-digit sequential rank.',
      },
      {
        id: 'fender_cs_time_machine',
        name: 'R-prefix (Custom Shop Time Machine)',
        yearRange: '1999+',
        example: 'R137487',
        rule: 'R + 5–6 digits. The R-number is assigned when the neck blank is cut, sometimes years before the guitar ships — so no year is encoded.',
      },
      {
        id: 'fender_cs_american_custom',
        name: 'XN-prefix (Custom Shop American Custom)',
        yearRange: '2012+',
        example: 'XN16552',
        rule: 'XN + 5 digits sequential rank. Successor to the CZ prefix. Sellers often drop the XN prefix when listing.',
      },
      {
        id: 'fender_pre1976_neckplate',
        name: 'Pre-1976 neck-plate (4–6 digit)',
        yearRange: '1954–1976',
        example: '234567',
        rule: "Bare numeric neck-plate serial from the pre-decade-prefix era. 4-5 digits = 1954-1963; L-prefix + 5 digits = 1963-1965; 6 digits on an F-plate = 1965-1976. Year ranges overlap heavily across years because Fender used pre-numbered neckplates as they came off the production line, so the serial alone can't pin the year without cross-referencing the neck-heel date and pot codes.",
        gotchas: [
          'Overlap is severe: a given 6-digit serial can span two or three years. The neck-heel pencil date and pot codes are more reliable for exact dating.',
          'Stolen-and-refurbished instruments occasionally swap neckplates across bodies; always verify the neck-date matches.',
        ],
      },
      {
        id: 'fender_l_series',
        name: 'L-series neck-plate (1963–1965)',
        yearRange: '1963–1965',
        example: 'L12345',
        rule: 'L + 5 digit numeric neck-plate serial. The "L" was reportedly a mistake originally intended to be a "1" for the 100,000 range and stuck. Bridges the gap between the 4-5 digit pre-L era and the 6-digit F-plate era.',
      },
      {
        id: 'fender_japan_jv',
        name: 'Japan Vintage JV (1982–1984)',
        yearRange: '1982–1984',
        example: 'JV12345',
        rule: 'JV + 5-6 digit sequential. Made for the export market starting with the 52/57/62 Stratocaster and Telecaster reissues — the "Japan Vintage" program was Fender\'s response to the vintage-reissue demand that helped re-establish the company\'s reputation post-CBS.',
      },
      {
        id: 'fender_japan_sq',
        name: 'Japan Squier SQ (1983–1984)',
        yearRange: '1983–1984',
        example: 'SQ12345',
        rule: 'SQ + 5-6 digit sequential. Companion to JV — the Squier-branded version of the Japan Vintage program. This is the ONLY Squier format that Fender-brand dispatch routes through; later Squier serials use the separate Squier brand matcher.',
      },
      {
        id: 'fender_neckplate',
        name: '8-digit bare neck-plate (legacy / ambiguous)',
        yearRange: 'Rare',
        example: '12345678',
        rule: '8-digit bare numeric under Fender brand. Rare legitimately — most post-2000 Fenders use US/MX/JD prefixes, and pre-1976 neck-plates are 4-6 digits. An 8-digit numeric is most often a US-prefix (US+6-9 digit) serial with the "US" accidentally dropped. Year is not encoded.',
        gotchas: [
          "If you typed the serial yourself and it's 8 digits, double-check whether it actually starts with US.",
        ],
      },
      {
        id: 'fender_avri_bridge',
        name: 'AVRI bridge-plate short-numeric',
        yearRange: 'Any',
        example: '9978',
        exampleYear: 1988,
        exampleModelHint: "American Vintage '52 Telecaster",
        rule: 'Short 4–5 digit number stamped on the bridge plate of American Vintage Reissue models. Only claimed when the model hint clearly indicates an AVRI reissue (the word "vintage" plus a body-style token, or a quoted decade like \'52 or \'60s).',
        gotchas: [
          'Capped at medium confidence — bridge-plate short-numerics are too ambiguous to promote to high or verified.',
        ],
      },
    ],
    findSerial: {
      intro:
        'Fender serial locations have moved around over the years. The most common spots are the neck plate (pre-1976), the headstock decal (post-1976), the bridge plate (AVRI), and inside the neck pocket (Custom Shop masterbuilt).',
      locations: [
        {
          place: 'Neck plate (1950s–1976)',
          description:
            'A 4- or 8-digit serial stamped on the metal neck plate on the back of the guitar body. Universal for USA Fenders before the decade-prefix era.',
        },
        {
          place: 'Headstock decal — front or back (1976+)',
          description:
            'Post-1976 USA Fenders use a decal with the decade-prefix serial (S/E/N/Z) or the US + YY format on 2000+ models. Location varies by era but is almost always on the headstock.',
        },
        {
          place: 'Bridge plate (AVRI reissues)',
          description:
            'American Vintage Reissue instruments stamp a short 4–5 digit number on the bridge plate. The headstock typically carries a separate V-prefix serial.',
        },
        {
          place: 'Neck-pocket / heel (Custom Shop)',
          description:
            'Custom Shop Masterbuilt and Time Machine models often have a builder signature, date, and internal serial written in the neck pocket or on the heel of the neck.',
        },
      ],
    },
  },

  prs: {
    id: 'prs',
    slug: 'prs',
    intro:
      "Paul Reed Smith's serial numbering splits by production origin. Core and S2 are made in Stevensville, Maryland; CE is the older Stevensville economy line; SE is imported (historically Korea, now Indonesia). Most modern PRS formats encode the year somewhere in the digits.",
    sources: [
      {
        label: 'PRS — Year Identification (official)',
        url: 'https://support.prsguitars.com/hc/en-us/articles/4408314427547-Year-Identification',
        kind: 'manufacturer',
        note: 'The authoritative source. PRS publishes per-year sequential ranges for every model line — set-neck Core (1985–2024), S2 (2013–2024), CE (1988–2008), EG (1990–1995), Swamp Ash Special (1997–2009), and all three bass variants. The decoder ships every row verbatim.',
      },
      {
        label: 'Hendrix Guitars — PRS Set-Neck Sequential Serial Numbers',
        url: 'https://www.hendrixguitars.com/PRS.htm',
        kind: 'reference',
        note: 'Earlier community cross-reference covering 1985–2005 — corroborates the first 21 rows of the PRS official set-neck table.',
      },
    ],
    formats: [
      {
        id: 'prs_core_pre2008',
        name: 'Core set-neck pre-2008 single-digit year (1985–2007)',
        yearRange: '1985–2007',
        example: '523000',
        exampleYear: 1995,
        rule: "Single-digit year prefix + 4–6 sequential digits. The leading digit is the last digit of the production year — so 6 could be 1986, 1996, or 2006. We disambiguate via PRS's official set-neck range table, which lists cumulative sequentials for every year 1985–2024. Each decade's candidate year is cross-checked: the decoded year's last digit must match the prefix or the match is rejected.",
        gotchas: [
          "If the sequential doesn't fall in a documented set-neck range, the matcher returns year null; listing-year context drives the confidence tier via the three-tier rule.",
          'The same single-digit prefixes can mean different model lines ("7" = CE 1988–1997; "8" = Swamp Ash; "5" = EG; "4"/"9" = bass). The decoder tries set-neck Core first and falls back to the model-specific range tables only when a model hint indicates a CE / Swamp Ash / EG / bass instrument.',
        ],
      },
      {
        id: 'prs_core',
        name: 'Core / CE 2008+ two-digit year',
        yearRange: '2008+',
        example: '08123456',
        rule: 'The first two digits are the last two digits of the year (08, 09, 10–29). The remaining four-to-six are sequential. PRS switched to the two-digit convention in 2008 to eliminate decade ambiguity.',
      },
      {
        id: 'prs_s2',
        name: 'S2 Series (2013–2024)',
        yearRange: '2013–2024',
        example: 'S2050000',
        exampleYear: 2021,
        rule: "S2 followed by 6–7 digits. The sequence is cumulative across years; PRS's official support article publishes per-year range boundaries for every year 2013–2024. The decoder ships the full table and returns the year whose range contains the sequential.",
        gotchas: [
          "Two published quirks: the 2019/2020 boundary both read 2043719 in PRS's source (first-match-wins returns 2019); there's a gap from S2067489 to S2071819 between 2023 and 2024 where the decoder honestly returns year null rather than extrapolate.",
        ],
      },
      {
        id: 'prs_ce',
        name: 'CE — range-decoded (1988–2008)',
        yearRange: '1988–2008',
        example: 'CE20000',
        exampleYear: 1999,
        rule: 'CE + 1–6 digit sequential. Literal "CE" prefix (which PRS used from 1998 onward) decodes unambiguously via the official CE range table (1988–2008). Pre-1998 CE serials carry a single-digit "7" prefix instead; those require a "CE" model hint to disambiguate from Core set-neck.',
        gotchas: [
          'A 1988–1997 CE with a "7" prefix (e.g. "71234") could be read as Core\'s year-digit "7" = 1987 or 1997. The decoder runs the Core Y-cross-check first and falls through to CE only when (a) Core doesn\'t yield a valid year and (b) the model hint mentions CE.',
        ],
      },
      {
        id: 'prs_swamp_ash',
        name: 'Swamp Ash Special (1997–2009)',
        yearRange: '1997–2009',
        example: 'SA500',
        exampleYear: 1998,
        rule: 'SA + 1–6 digit sequential (1998+), or single-digit "8" prefix (1997–1998, model-hint gated). Year decoded via the official Swamp Ash range table.',
      },
      {
        id: 'prs_eg',
        name: 'EG models (1990–1995)',
        yearRange: '1990–1995',
        example: '52000',
        exampleYear: 1992,
        exampleModelHint: 'PRS EG',
        rule: 'Single-digit "5" prefix + sequential. Decodes via the official EG range table (6 years, sequentials 1–3300). Requires a model hint to disambiguate from Core set-neck (where "5" also appears as the year digit for 1985/1995/2005).',
      },
      {
        id: 'prs_bass_bolt_on',
        name: 'Bolt-On Bass (1989–1991)',
        yearRange: '1989–1991',
        example: '40100',
        exampleYear: 1990,
        exampleModelHint: 'PRS bass',
        rule: 'Single-digit "4" prefix + sequential (seq 1–200). Requires a model hint containing "bass" to disambiguate from other "4" single-digit-year Core serials.',
      },
      {
        id: 'prs_bass_set_neck',
        name: 'Set-Neck Bass (1986–1991)',
        yearRange: '1986–1991',
        example: '90500',
        exampleYear: 1989,
        exampleModelHint: 'PRS bass',
        rule: 'Single-digit "9" prefix + sequential (seq 1–800). Requires a model hint containing "bass". The official PRS table lists 1986 and 1987 as a combined row — the decoder reports it as 1987 (the later end).',
      },
      {
        id: 'prs_bass_electric',
        name: 'Electric Bass (2000–2004)',
        yearRange: '2000–2004',
        example: 'EB00100',
        exampleYear: 2001,
        rule: 'EB + 1–5 digit sequential. Literal "EB" prefix means no collision with other formats — no model hint required.',
      },
      {
        id: 'prs_cti',
        name: 'CTI — Indonesia (2018+)',
        yearRange: '2018+',
        example: 'CTIA123456',
        rule: 'CTI + single letter + 4–6 digits. The letter encodes the year: A = 2018, B = 2019, C = 2020, etc.',
      },
      {
        id: 'prs_ia',
        name: 'IA–IE — SE Indonesia (2014–2018)',
        yearRange: '2014–2018',
        example: 'IA123456',
        rule: 'I + letter A–E + 4–6 digits. A = 2014, B = 2015, C = 2016, D = 2017, E = 2018. Bridge period between the SE Korea single-letter era and the CTI prefix era.',
      },
      {
        id: 'prs_se_korea',
        name: 'SE Korea single-letter year (2000–2022)',
        yearRange: '2000–2022',
        example: 'H12345',
        rule: 'Single letter A–W + 3–6 sequential digits. Letter encodes year: A = 2000, B = 2001, …, I = 2008, …, U = 2020, V = 2021, W = 2022. Most SE Korea instruments were produced by World Musical Instruments.',
        gotchas: [
          'PRS SE launched publicly in 2001; the letter A=2000 is documented in community charts and likely reflects a late-2000 pre-production run.',
          'Acoustic A-prefix format (A + YY + sequential) is checked first and wins when YY is in 09–29; otherwise A-letter falls through to SE Korea 2000.',
          'Letters X, Y, Z (2023+) are not part of the documented SE Korea chart and fall through — serials starting with those letters are rejected rather than extrapolated.',
        ],
      },
      {
        id: 'prs_acoustic',
        name: 'Acoustic A + YY (2009+)',
        yearRange: '2009+',
        example: 'A091234',
        rule: 'A + 2-digit year + 4–6 sequential. Example A091234 = 2009, #1234. PRS acoustics launched at Winter NAMM 2009 (Angelus Cutaway, Tonare Grand).',
        gotchas: ['YY is gated to 09–29 to avoid shadowing the SE Korea A-prefix (2000) era.'],
      },
    ],
    findSerial: {
      intro:
        'PRS serials appear on the back of the headstock on all modern production. Older and custom-built models may also have a neck-plate or truss-rod-area serial.',
      locations: [
        {
          place: 'Back of headstock',
          description:
            'The primary location for Core, S2, CE, SE, and Private Stock. The serial is impressed through the finish.',
        },
        {
          place: 'Truss-rod cavity cover (some older CE / Core)',
          description:
            'Some pre-2000 models have an additional stamp inside the truss-rod cavity that matches the headstock serial.',
        },
      ],
    },
  },

  heritage: {
    id: 'heritage',
    slug: 'heritage',
    intro:
      'Heritage Guitars has been building in the former Gibson Kalamazoo factory since 1985. Their standard serial scheme uses a leading letter (B = 1985) that increments through the alphabet, with a post-2009 switch to a double-letter format. A number of bare 6-digit Kalamazoo-stamped instruments exist and are not documented in any official decoder — we recognize the format but leave the year unknown.',
    sources: [
      {
        label: 'Heritage Guitars — Date Your Heritage',
        url: 'https://heritageguitars.com/pages/date-your-heritage',
        kind: 'manufacturer',
        note: "Heritage's official dating tool with a letter-to-year dropdown spanning B (1985) through AP (2025).",
      },
      {
        label: 'Heritage Owners Club — Decoding Heritage Serial Numbers',
        url: 'http://www.heritageownersclub.com/info_serials.htm',
        kind: 'community',
        note: 'Community reference confirming the single-letter and double-letter year conventions and detailing the post-letter digit layout (day-of-year-remaining + build rank).',
      },
    ],
    formats: [
      {
        id: 'heritage_single',
        name: 'Single-letter (B–Y)',
        yearRange: '1985–2008',
        example: 'H12345',
        rule: 'Single letter B–Y followed by 5 digits. B = 1985, C = 1986, …, Y = 2008. Heritage skipped Z entirely — 2009 instruments used the 1YYXXXX standard-collection format, and the double-letter system picked up at AA = 2010.',
        gotchas: [
          'Earlier drafts of this decoder mapped Z = 2009. Heritage\'s official "Date Your Heritage" dropdown jumps directly from Y (2008) to AA (2010), so Z = 2009 was never a real mapping.',
        ],
      },
      {
        id: 'heritage_double',
        name: 'Double-letter (AA–AP)',
        yearRange: '2010–2025',
        example: 'AA12345',
        rule: 'A followed by a second letter A–P and 5 digits. Second letter increments from A (2010) through the alphabet: AA = 2010, AB = 2011, …, AP = 2025.',
        gotchas: [
          'Earlier decoders assumed a "double-the-letter" scheme (AA/BB/CC/...) which is wrong — the sequence is A-followed-by-any-letter.',
          'Capped at AP (2025) per Heritage\'s official "Date Your Heritage" dropdown. AQ and later are not part of the published chart and are rejected rather than extrapolated.',
        ],
      },
      {
        id: 'heritage_cs',
        name: 'HC-prefix Custom Shop (HC1YYXXXX)',
        yearRange: '2020+',
        example: 'HC1201234',
        exampleYear: 2020,
        rule: "HC + 1 + YY + 4-digit rank. After the HC prefix the leading 1 mirrors the standard-format identifier; the next two digits are the 2-digit year (2020+). Heritage's official decoder documents only this 8-character layout; a bare HC + 4–7 digit form previously matched here has been removed for lack of sourcing.",
      },
      {
        id: 'heritage_standard',
        name: 'Numeric 1YYXXXX (2020+)',
        yearRange: '2020+',
        example: '1201234',
        rule: 'Seven-digit serial starting with 1. Digits 2–3 are the 2-digit year; digits 4–7 are the rank.',
      },
      {
        id: 'heritage_numeric_6',
        name: 'Bare 6-digit Kalamazoo stamp',
        yearRange: 'Unknown',
        example: '007704',
        rule: 'Six-digit purely-numeric stamp confirmed on genuine Kalamazoo-built Heritage instruments but undocumented in any official source. We match the format but leave the year unknown.',
      },
    ],
    findSerial: {
      intro:
        'Heritage serials are impressed on the back of the headstock. Custom Shop and small-run instruments sometimes also carry a paper label inside the body.',
      locations: [
        {
          place: 'Back of headstock',
          description: 'Primary location for all standard Heritage instruments across all eras.',
        },
        {
          place: 'F-hole label (hollowbody)',
          description:
            'Archtop and semi-hollow Heritage models typically have a corresponding label visible through the F-hole.',
        },
      ],
    },
  },

  sire: {
    id: 'sire',
    slug: 'sire',
    intro:
      "Sire's modern serials come in two generations: an 8-digit plain numeric (Gen 1) and a 2N-prefixed 10-digit format (Gen 2). Both encode the year in the first two significant digits.",
    sourceNote:
      'Sire does not publish an official serial-number decoder. The YYWW convention below is consistently reported by community resellers and dealer references; we have not sighted a canonical Sire-authored specification. If you have a manufacturer-authored source, please open an issue.',
    sources: [
      {
        label: 'Still Kickin Music — Lakland and Sire Serial Number Database',
        url: 'https://stillkickinmusic.com/blogs/still-kickin-blog/lakland-and-sire-added-to-serial-number-database',
        kind: 'community',
        note: 'Dealer-maintained serial-number database; documents the YYWW-prefix convention used by Sire across Gen 1 and Gen 2 serials.',
      },
    ],
    formats: [
      {
        id: 'sire_gen1',
        name: 'Gen 1 — 8-digit',
        yearRange: 'Varies',
        example: '20123456',
        rule: 'Eight plain digits. The first two are the 2-digit year, the remaining six are sequential.',
      },
      {
        id: 'sire_gen2',
        name: 'Gen 2 — 2N + 8 digits',
        yearRange: 'Current',
        example: '2N21123456',
        rule: 'The 2N prefix, then 8 digits. The first two post-prefix digits are the 2-digit year, the remaining six are sequential.',
      },
    ],
    findSerial: {
      intro:
        'Sire serials are printed or stamped on the back of the headstock on current production.',
      locations: [
        {
          place: 'Back of headstock',
          description:
            'Standard location for all current Sire instruments; the serial is printed or lightly impressed.',
        },
      ],
    },
  },

  ibanez: {
    id: 'ibanez',
    slug: 'ibanez',
    intro:
      'Ibanez has been made at several factories since the 1970s: Fujigen (Japan, F-prefix), plus Korean (C-prefix) and Indonesian (I-prefix) production. The Japanese F-prefix format changed in 1997 — from 1987 to 1996 a single digit encoded the year, after 1997 two digits do. Pre-F Japanese instruments (1975–1988) used a letter-month prefix that clashed with the later F-prefix and is matched first.',
    sourceNote:
      'Ibanez does not publish an official serial-number decoder (per their own support FAQ: "Ibanez does not manage models by serial number and does not disclose serial number information to the public"). Our rules are derived from the longest-standing community references below, cross-verified against dated instruments and Fujigen production records.',
    sources: [
      {
        label: 'Ibanez Rules — Date Your Ibanez',
        url: 'https://www.ibanezrules.com/catalogs/reference/dating.htm',
        kind: 'community',
        note: 'Long-standing community reference that documents the F-prefix length-branch distinction (F + 6 digits = 1987-1996 single-Y; F + 7-8 digits = 1997+ YY) and the C/I/pre-F letter-month formats.',
      },
      {
        label: 'Ibanez Wiki — Serial Numbers',
        url: 'https://ibanez.fandom.com/wiki/Ibanez_serial_numbers',
        kind: 'community',
        note: 'Community-maintained wiki corroborating Fujigen (F), Korean (C), and Indonesian (I) prefix conventions and month-letter pre-F format.',
      },
    ],
    formats: [
      {
        id: 'ibanez_japan_letter_month',
        name: 'Pre-F letter-month Japan (1975–1988)',
        yearRange: '1975–1988',
        example: 'A790665',
        rule: 'A single letter encoding the month (A = January, B = February, …, L = December), followed by the 2-digit year (75–88) and a 4-digit monthly sequence.',
        gotchas: [
          'Only claimed when the 2-digit year is in the 75–88 range — otherwise it would shadow the Korean C or Indonesian I prefixes (which use arbitrary sequences).',
          'Must be matched before the F-prefix so "F" letter-month (June) doesn\'t also match the Fujigen F-prefix.',
        ],
      },
      {
        id: 'ibanez_japan_f',
        name: 'Fujigen F-prefix (Japan)',
        yearRange: '1987+',
        example: 'F9825445',
        rule: 'Length distinguishes the era. 6 digits (1987–1996): the single digit after F is the year (7=1987, 8=1988, 9=1989, 0=1990, 1=1991, …, 6=1996). 7 digits (1997+): the first two digits after F are the 2-digit year.',
        gotchas: [
          'Earlier decoders assumed a 2-digit year in all F-prefix cases, producing nonsense decodes like F320327 → 2032 for a 1993 instrument. The length-branch fix is authoritative per Fujigen production records.',
          'F + 8 digits is not a documented Fujigen format; previously accepted here, now rejected. If you have a confirmed 8-digit F-prefix Ibanez, please open an issue with the instrument details.',
        ],
      },
      {
        id: 'ibanez_indonesia',
        name: 'I-prefix Indonesia (Cor-Tek)',
        yearRange: 'Varies',
        example: 'I160600221',
        rule: 'I followed by 9 digits = YY + MM + 5-digit sequence (e.g. I160600221 = June 2016, #221). 7 or 8 digit variants fall back to year-unknown.',
        gotchas: [
          'Month must be 01-12 for the 9-digit branch to decode year; otherwise the serial falls back to year-unknown.',
          'Production numbers 00001-49999 are acoustics; 50000-99999 are electric guitars and basses (shared convention across all three Indonesian factories).',
        ],
      },
      {
        id: 'ibanez_indonesia_kwo_hsiao',
        name: 'K-prefix Indonesia (Kwo Hsiao)',
        yearRange: 'Varies',
        example: 'K160600221',
        rule: 'K followed by 9 digits = YY + MM + 5-digit sequence (e.g. K160600221 = June 2016, #221, Kwo Hsiao Co., Ltd.). Same layout as the I-prefix Cor-Tek format but a different Indonesian factory.',
        gotchas: [
          'Month must be 01-12 for year decoding; otherwise falls back to year-unknown.',
          'Same acoustic/electric production-range split (00001-49999 = acoustics, 50000-99999 = electrics) as the Cor-Tek and Samick Indonesian factories.',
        ],
      },
      {
        id: 'ibanez_korea',
        name: 'C-prefix Korea (Cort)',
        yearRange: 'Varies',
        example: 'C1234567',
        rule: 'C followed by 6–8 digits. Cort-factory Korea production. Year encoding varies by era; we match the format but leave the year undecoded.',
      },
      {
        id: 'ibanez_korea_samick',
        name: 'S-prefix Korea (Samick, 1990–1995)',
        yearRange: '1990–1995',
        example: 'S4110076',
        rule: 'S + Y + MM + PPPP (7 digits after S). Y is the last digit of the year (0 = 1990, 1 = 1991, …, 5 = 1995). MM is the month (01-12). Example S4110076 = November 1994, #76.',
        gotchas: [
          'Gated tightly on the Samick window (Y ≤ 5); Samick stopped making Ibanez after 1995.',
        ],
      },
      {
        id: 'ibanez_korea_world',
        name: 'W-prefix Korea (World Musical Instrument Co.)',
        yearRange: 'Varies',
        example: 'W02Y12345',
        rule: 'W + YY + M + RRRR (up to 8 digits after W). YY is the 2-digit year, M is the month (1-9 = Jan-Sep, X = Oct, Y = Nov, Z = Dec). Example W02Y12345 = November 2002.',
      },
      {
        id: 'ibanez_indonesia_samick',
        name: 'SI-prefix Indonesia (Samick)',
        yearRange: 'Varies',
        example: 'SI4110076',
        rule: "SI + 7 digits = Y + MM + PPPP (single-digit-year 2000s convention, e.g. SI4110076 = November 2004). SI + 9 digits = YY + MM + PPPPP (2-digit year, same layout as the Cor-Tek I-prefix). Samick's Indonesian plant reused the YMMPPPP and YYMMPPPPP conventions from its Korean operation.",
        gotchas: [
          'Month must be 01-12 for year decoding; otherwise falls back to year-unknown.',
          'Single-digit year form (7 digits after SI) maps 0-9 to 2000-2009 — Samick Indonesia production began in the 2000s, so there is no pre-2000 ambiguity.',
        ],
      },
    ],
    findSerial: {
      intro:
        'Ibanez serial locations depend on the factory. Most Japanese and Korean/Indonesian production uses the back of the headstock; some archtops and basses use a neck-joint stamp.',
      locations: [
        {
          place: 'Back of headstock',
          description:
            'Primary location for the vast majority of Ibanez production across all eras.',
        },
        {
          place: 'Neck joint / neck pocket',
          description:
            'Some early Fujigen instruments and certain bass models stamp the serial on the neck heel or inside the neck pocket instead of the headstock.',
        },
      ],
    },
  },
};

BRAND_GUIDES.gretsch = {
  id: 'gretsch',
  slug: 'gretsch',
  intro:
    'Gretsch serial numbering split into three distinct eras. Pre-1966 numbers were largely sequential. From 1966 to the end of Baldwin-era production (1972-ish) Gretsch used a date-coded format that packs the month, year, and production rank into a short numeric. Modern production (2003+) uses a clean two-letter factory code followed by YY + MM + a 4-digit sequence.',
  sources: [
    {
      label: 'Gretsch Guitars — Product Dating (official)',
      url: 'https://www.gretschguitars.com/support/product-dating',
      kind: 'manufacturer',
      note: "Gretsch's official dating resource covering all eras.",
    },
    {
      label: 'GretschTech — Understanding Modern Gretsch Serial Numbers',
      url: 'https://blog.gretschguitars.com/2013/07/gretschtech-understanding-modern-gretsch-serial-numbers/',
      kind: 'manufacturer',
      note: "Gretsch's own blog post documenting every modern factory code (JT, JD, JF, KP, KS, CY, CS) and the YY+MM+seq layout.",
    },
    {
      label: 'GretschTech — Serial Numbers 1930s-1966',
      url: 'https://blog.gretschguitars.com/2016/05/gretschtech-serial-numbers-1930s-1966/',
      kind: 'manufacturer',
      note: 'Companion article covering the pre-1966 sequential era.',
    },
    {
      label: 'Reverb — How To Date A Gretsch Guitar',
      url: 'https://reverb.com/news/how-to-date-a-gretsch-guitar',
      kind: 'reference',
      note: 'Comprehensive Reverb article documenting the 1966-1972 date-coded format with examples.',
    },
  ],
  formats: [
    {
      id: 'gretsch_modern',
      name: 'Modern (2003+) — factory + YY + MM + seq',
      yearRange: '2003+',
      example: 'JT07115922',
      rule: 'Two-letter factory code + 2-digit year + 2-digit month + 4-digit sequence. Factory codes: JT = Japan Terada (most common), JD = Japan Dyna Gakki, JF = Japan Fuji-Gen Gakki, KP = Korea Peerless, KS = Korea Samick/SPG, CY = China Yako, CS = USA Custom Shop. Example JT07115922 = Japan Terada, November 2007, #5922.',
    },
    {
      id: 'gretsch_date_coded_1966_1972',
      name: 'Date-coded (1966–1972)',
      yearRange: '1966–1972',
      example: '118145',
      exampleYear: 1968,
      rule: 'First digit(s) are the numerical month (1-12), next digit is the last digit of the year (7, 8, 9 for 1967–1969 and 0, 1, 2 for 1970–1972), remaining digits are the production rank. Example 118145 = November (11) 1968 (8), #145.',
      gotchas: [
        "Baldwin-era Gretsch guitars from the 1972-1981 window use hyphenated serials (e.g. '2-365') that we don't decode — those predate the modern codes and postdate the date-coded era.",
        'Without a listing year near 1966-1972, we require the year-digit to be in the valid 0-2/6-9 range and plausibility-check the resulting year.',
      ],
    },
    {
      id: 'gretsch_pre1966_sequential',
      name: 'Pre-1966 sequential (1939–1965)',
      yearRange: '1939–1965',
      example: '45000',
      rule: 'A single rising sequence from 001 (1939) up through ~84000 (1965). 1939-1945 = handwritten 3-4 digits on the inside of the body. 1945-1954 = 4-digit written in pencil or on a label. 1954-1965 = 5-digit on a label or headstock (~13000-84000 range). Year ranges overlap significantly across years — the serial alone narrows to a window, not a specific year.',
      gotchas: [
        'Pre-1939 Gretsch instruments often have no serial number at all — dating those requires feature-based analysis (pickups, hardware, binding).',
        "Five-digit serials from this era overlap with the 1966-1972 date-coded format on the first character; the matcher tries the date-coded interpretation first and falls back to pre-1966 sequential when the year/month digits aren't valid.",
      ],
    },
  ],
  findSerial: {
    intro:
      'Gretsch serial location varies by era. Hollowbody models usually carry a serial on a label inside the F-hole and/or stamped on the headstock. Solidbody modern models are stamped on the back of the headstock or on the neckplate.',
    locations: [
      {
        place: 'Back of headstock (modern solidbody)',
        description:
          'Standard location for modern Electromatic, Streamliner, and Professional solidbody models.',
      },
      {
        place: 'Label inside F-hole (hollowbody)',
        description:
          'Modern and vintage hollowbody Gretsch instruments typically carry a serial on a label visible through the F-hole. On Baldwin-era instruments the serial may only appear on this label.',
      },
      {
        place: 'Back of headstock / top of headstock (pre-1966)',
        description:
          'Pre-1966 Gretsch often has the serial impressed or stamped on the headstock (top or back varies by model).',
      },
    ],
  },
};

BRAND_GUIDES.rickenbacker = {
  id: 'rickenbacker',
  slug: 'rickenbacker',
  intro:
    'Rickenbacker has used five well-defined serial schemes since the mid-1950s. Pre-1961 (1954–1959): model letter (B = bass, C = combo, M = mandolin, G = guitar) + year digit + production number. JK/JL: November and December 1960 respectively — a two-letter pilot of the permanent system. 1961–1986: year letter (A = 1961 through Z = 1986) + month letter (A–L) + production rank. 1987–1996: month letter (A–L) + year digit (0 = 1987 through 9 = 1996) + rank. 1996+: month letter from M–Y (O skipped) + year digit. The 1996+ year digit cycles every decade, so 2006+ decoding needs a listing year for decade snap.',
  sources: [
    {
      label: 'Rickenbacker — Serial Number Decoder (official)',
      url: 'https://www.rickenbacker.com/serial-number-decoder/',
      kind: 'manufacturer',
      note: "Rickenbacker's own serial-number decoder.",
    },
    {
      label: 'Reverb — Finding the Date of Your Rickenbacker Guitar or Bass',
      url: 'https://reverb.com/news/finding-the-date-of-your-rickenbacker-guitar-or-bass',
      kind: 'reference',
      note: 'Comprehensive Reverb article documenting all era formats: pre-1960 year-digit, JK/JL November-December 1960 transition, 1987-1996 month-letter-plus-digit, 1996+ M-Y month letters.',
    },
    {
      label: 'Rickenbacker 101 — Serial Numbers 101',
      url: 'https://www.rickenbacker101.com/p/serial-numbers-101',
      kind: 'reference',
      note: "Andy White's comprehensive community reference covering every era.",
    },
  ],
  formats: [
    {
      id: 'rickenbacker_pre1961',
      name: 'Pre-1961 model-coded (1954–1959)',
      yearRange: '1954–1959',
      example: 'B4123',
      rule: 'First letter encodes the instrument type (B = bass, C = combo (Rickenbacker guitar style), M = mandolin, G = guitar). Second digit encodes the year within the 1950s (4 = 1954, 5 = 1955, …, 9 = 1959 through September). Remaining 2-5 digits are a production number.',
      gotchas: [
        'Only the four documented model letters (B/C/M/G) are accepted — other letters are too rare or undocumented to decode safely.',
        'Format ended in September 1959 when Rickenbacker moved to the permanent year-letter + month-letter system; October 1959 onward uses the 1961–1986 convention even though the letter run started mid-1959.',
      ],
    },
    {
      id: 'rickenbacker_1960_jk_jl',
      name: 'JK / JL transition (Nov–Dec 1960)',
      yearRange: '1960',
      example: 'JK123',
      rule: 'JK = November 1960, JL = December 1960. These two prefixes preview the permanent two-letter system (J = 1960 year letter, K = November, L = December) and are the only 1960 serials that use it.',
      gotchas: [
        'Earlier 1960 instruments carried over the pre-1961 model-coded format before Rickenbacker transitioned in November.',
      ],
    },
    {
      id: 'rickenbacker_1961_1986',
      name: '1961–1986 (year letter + month letter)',
      yearRange: '1961–1986',
      example: 'AB1234',
      rule: 'First letter = year (A = 1961, B = 1962, …, Z = 1986). Second letter = month (A = January, B = February, …, L = December). Remaining 3-5 digits are a production rank. Example AB1234 = February 1961.',
      gotchas: [
        'Distinct from the 1987–1996 format because the second character is a letter (A–L) rather than a digit.',
        'Matched before the 1987–1996 rule so the two-letter form wins over a letter+digit form when the second character could be either.',
      ],
    },
    {
      id: 'rickenbacker_1987_1996',
      name: '1987–1996 (month letter + year digit)',
      yearRange: '1987–1996',
      example: 'A0001',
      rule: 'First character = month (A=Jan, B=Feb, …, L=Dec). Second character = year digit (0=1987, 1=1988, …, 9=1996). Remaining 3-5 digits are a production rank. Example A0001 = January 1987.',
    },
    {
      id: 'rickenbacker_1996_plus',
      name: '1996+ (M–Y month letters)',
      yearRange: '1997+',
      example: 'M0001',
      rule: 'First character = month letter from M–Y, with O skipped (M=Jan, N=Feb, P=Mar, Q=Apr, R=May, S=Jun, T=Jul, U=Aug, V=Sep, W=Oct, X=Nov, Y=Dec). Second character = year digit (0=1997, 1=1998, …). The year digit cycles every decade, so 2007-2016 and 2017+ reuse the 0-9 digits.',
      gotchas: [
        'Year digit cycles every 10 years. Without a listing-year hint, the decoder leaves the year null for 1996+ serials; with a listing year we snap to the closest plausible decade.',
      ],
    },
  ],
  findSerial: {
    intro:
      'Rickenbacker serial numbers are usually on the jackplate (the plate surrounding the output jack). The serial is typically split into two parts — a short prefix at one end of the plate and the production number at the other end.',
    locations: [
      {
        place: 'Jackplate (both ends)',
        description:
          'The two-character month/year prefix lives at one end of the jackplate; the production number lives at the other end. Together they form the complete serial.',
      },
    ],
  },
};

BRAND_GUIDES.jackson = {
  id: 'jackson',
  slug: 'jackson',
  intro:
    "Jackson's serial history splits across three main production groups. USA San Dimas and Ontario models from the 1980s onward use simple sequential prefixes (J, RR, U). Made-In-Japan Professional series 1990–1995 embed the year in the first digit. Modern import production (2013+) uses a 10-character format with a 3-letter factory code followed by YY + 5 digits.",
  sources: [
    {
      label: 'Jackson Guitars — Bolt-On-Neck Product Dating (official)',
      url: 'https://support.jacksonguitars.com/en-us/knowledgebase/article/KA-02021',
      kind: 'manufacturer',
      note: "Jackson's official support article covering the modern 10-character import format and earlier USA serials.",
    },
    {
      label: 'USA Charvels — Serial Numbers',
      url: 'http://www.usacharvels.com/serials.htm',
      kind: 'reference',
      note: 'Long-standing community reference that covers the USA Jackson/Charvel serial history including Randy Rhoads variants.',
    },
    {
      label: 'The Music Zoo — Jackson Guitars Serial Number Archive 1983-1985',
      url: 'https://www.themusiczoo.com/blogs/news/jackson-guitars-serial-number-archive-1983-1985-at-the-music-zoo',
      kind: 'reference',
      note: 'Early-era dealer reference documenting the J and RR serial launches.',
    },
  ],
  formats: [
    {
      id: 'jackson_modern_import',
      name: 'Modern import (2013+) — factory + YY + seq',
      yearRange: '2013+',
      example: 'ICJ1500001',
      rule: 'Three-letter factory code + 2-digit year + 5-digit sequence. Country prefix (letter 1): I = Indonesia, C = China, N = India, K = Korea, M/X = Mexico. Factory letter (letter 2): C = Cort, W = World Musical Instruments, S = Samick, Y = Yako, U = Unsung, H = Chushin Gakki (Harmony). Trailing J marks Jackson brand line. Documented codes: ICJ, ISJ, IWJ (Indonesia); CYJ, CJ, CUJ, CNJ, CSJ (China); NHJ (India); KCJ, KWJ, KSJ (Korea); plus 2-letter MJ and XJ (Mexico). Example ICJ1500001 = Indonesia Cort, 2015, #1.',
    },
    {
      id: 'jackson_rr_signature',
      name: 'Randy Rhoads RR signature',
      yearRange: '1983+',
      example: 'RR0001',
      rule: 'RR + 4-digit sequence. Assigned to Randy Rhoads neck-through guitars (all of them 1983–spring 1990, custom only after that).',
    },
    {
      id: 'jackson_usa',
      name: 'USA J-prefix (1983+)',
      yearRange: '1983+',
      example: 'J1234',
      rule: 'J + 4-digit sequence. Year is not encoded in the serial — listing-year context or USA Charvels serial archive lookup is required to date.',
    },
    {
      id: 'jackson_mij_professional',
      name: 'Made-in-Japan Professional (1990–1995)',
      yearRange: '1990–1995',
      example: '412345',
      rule: 'Six plain digits. The first digit is the year offset from 1990: 0 = 1990, 1 = 1991, …, 5 = 1995. Example 412345 = 1994, #12345.',
      gotchas: [
        'Gated tightly on first-digit ≤ 5 to avoid shadowing generic 6-digit numerics from other brands.',
      ],
    },
    {
      id: 'jackson_mij_1996_plus',
      name: 'Made-in-Japan bolt-on (1996–2012)',
      yearRange: '1996–2012',
      example: '9612345',
      rule: 'Seven plain digits. The first two digits are the 2-digit year. Covers the 1996–2012 MIJ bolt-on window that bridges the MIJ Professional era and the 3-letter modern-import era. Plausibility gate accepts leading pairs 96–99 (1996–1999) and 00–12 (2000–2012).',
      gotchas: [
        'Outside the 96–99 / 00–12 window the rule does not match to avoid collision with other 7-digit numeric serials.',
      ],
    },
    {
      id: 'jackson_mii_india',
      name: 'Made-in-India (JS20-series, 8-digit)',
      yearRange: '1996+',
      example: '19000123',
      rule: 'Eight plain digits. The first two digits are the 2-digit year. Used on Jackson JS-series instruments made in India (Chushin Gakki / Harmony). Plausibility gate: leading pair 96–99 (1996–1999) or 00–15 (2000–2015).',
    },
  ],
  findSerial: {
    intro:
      'Jackson serials are typically on the back of the headstock (modern production) or on the neckplate (earlier USA and some Japan production).',
    locations: [
      {
        place: 'Back of headstock',
        description:
          'Modern import (2013+) and most current production — 10-character serial is impressed or decaled on the back of the headstock.',
      },
      {
        place: 'Neckplate',
        description:
          'Earlier USA Jacksons and some Japan-made Professional series carry the serial on the metal neckplate on the back of the body.',
      },
    ],
  },
};

BRAND_GUIDES.charvel = {
  id: 'charvel',
  slug: 'charvel',
  intro:
    "Charvel (Jackson's sister brand) has three main serial eras. The pre-1986 San Dimas USA era used plain sequential 4-digit numbers, dated via a cumulative range table. Modern Japan Charvel production uses a JC prefix followed by YY and a sequential number. The current USA Pro-Mod line (2004+) uses a 6-digit neckplate serial that does not encode the year.",
  sources: [
    {
      label: 'USA Charvels — Serial Numbers',
      url: 'http://www.usacharvels.com/serials.htm',
      kind: 'reference',
      note: 'Authoritative community reference for San Dimas Charvel serials with cumulative year boundaries (1981=1001+, 1982=1096+, 1983=1725+, 1984=2939+, 1985=4262+, 1986=5304+).',
    },
    {
      label: 'Charvel Serial Number Decoder Guide',
      url: 'https://owningafather.com/charvel/serial-number-lookup',
      kind: 'reference',
      note: 'Dealer reference documenting the JC modern Japan format.',
    },
  ],
  formats: [
    {
      id: 'charvel_japan',
      name: 'Japan modern — JC + YY + seq',
      yearRange: '2013+',
      example: 'JC18000123',
      rule: 'JC + 2-digit year + 5-6 digit sequence. Example JC18000123 = Japan, 2018.',
    },
    {
      id: 'charvel_san_dimas',
      name: 'USA San Dimas (1981–1986)',
      yearRange: '1981–1986',
      example: '1234',
      rule: 'Plain 4-digit sequential starting at 1001 (1981). Year disambiguation uses the cumulative-range boundaries: 1981 = 1001-1095, 1982 = 1096-1724, 1983 = 1725-2938, 1984 = 2939-4261, 1985 = 4262-5303, 1986 = 5304+. We match the format and leave year null without range lookup.',
      gotchas: [
        'Decoder requires listing-year context to pin the exact year; the serial alone only narrows the range.',
      ],
    },
    {
      id: 'charvel_usa_promod',
      name: 'USA Pro-Mod (2004+)',
      yearRange: '2004+',
      example: '123456',
      rule: 'Six plain digits stamped on the neckplate. Year is not encoded in the serial itself; contact Charvel/Fender with the serial for the build date, or cross-reference the neck-heel date stamp.',
    },
  ],
  findSerial: {
    intro:
      'Charvel serials are typically on the back of the headstock (modern) or the neckplate (vintage San Dimas).',
    locations: [
      {
        place: 'Back of headstock',
        description: 'Modern Japan JC-prefix production.',
      },
      {
        place: 'Neckplate',
        description:
          'Vintage 1981–1986 San Dimas USA Charvels carry the serial on the metal neckplate.',
      },
    ],
  },
};

BRAND_GUIDES.epiphone = {
  id: 'epiphone',
  slug: 'epiphone',
  intro:
    "Epiphone's serial history is dominated by the FYYMMRRRR factory-prefix format, used from 1993 through 2008 across a sprawl of Asian contract manufacturers. Around 2008 production moved to an all-numeric YY+MM+6-digit sequence. Pre-1993 Epiphones used a variety of regional formats that we don't yet cover.",
  sources: [
    {
      label: 'Epiphone — Serial Number Search (official)',
      url: 'https://www.epiphone.com/en-US/Support/Serial-Number-Search',
      kind: 'manufacturer',
      note: "Epiphone's own serial-number search tool.",
    },
    {
      label: 'Epiphone Wiki — Serial Number Decoding',
      url: 'https://www.epiphonewiki.org/index/Epiphone_Serial_Number_Decoding.php',
      kind: 'community',
      note: 'Canonical community decoder documenting 25+ factory codes across Korea, Indonesia, China, Japan.',
    },
    {
      label: 'Killerrig — Epiphone Factory Codes',
      url: 'https://killerrig.com/epiphone-factory-codes/',
      kind: 'community',
      note: 'Additional dealer-compiled factory-code reference.',
    },
  ],
  formats: [
    {
      id: 'epiphone_factory',
      name: 'Factory prefix (1993–2008)',
      yearRange: '1993–2008',
      example: 'SI03021234',
      rule: '1 or 2-letter factory code + YY + MM + 4-digit rank. Factory codes: SI = Samick Indonesia, CI = Cort Indonesia, EE = Qingdao Electric (China), EA = Qingdao Acoustic (China), DW = DaeWon (China), MC = Muse (China), SJ = SaeJun (China), UC = Unsung China, FN = Fine Guitars (Korea), SM = Samil (Korea); single-letter codes S/U/P/R/I/F/T/Z/K/O/J for Korean/Japanese factories.',
      gotchas: [
        'The 1993-2008 window is exact; some outliers exist outside it — check the Epiphone Wiki for edge cases.',
      ],
    },
    {
      id: 'epiphone_numeric',
      name: 'All-numeric (2008+)',
      yearRange: '2008+',
      example: '1210123456',
      rule: 'Ten-digit all-numeric serial: YY + MM + 6-digit rank. Gated on YY in 08-29 range and valid month 01-12.',
    },
  ],
  findSerial: {
    intro:
      'Epiphone serials are almost universally on the back of the headstock (stamped, decaled, or inked). Some acoustic models have a label visible through the soundhole.',
    locations: [
      {
        place: 'Back of headstock',
        description: 'Standard location across all modern (1993+) Epiphone production.',
      },
      {
        place: 'Label inside soundhole (acoustic hollowbodies)',
        description:
          'Some Epiphone acoustic archtops and hollowbodies also carry a label on the inside of the body.',
      },
    ],
  },
};

BRAND_GUIDES.squier = {
  id: 'squier',
  slug: 'squier',
  intro:
    "Squier serials span Indonesian, Chinese, Korean, Japanese, and Mexican production. The factory prefix is the key indicator. Several formats share Fender's original decade-prefix (MN, MZ, E, N) conventions — a Squier-brand serial starting with MN still decodes the year via the single digit after the prefix.",
  sources: [
    {
      label: 'Squier Wiki — Serial Number Tracking',
      url: 'http://www.squierwiki.com/Serial-Number-Tracking',
      kind: 'community',
      note: 'Long-standing community reference documenting every Squier factory prefix and year-encoding convention.',
    },
    {
      label: 'Killerrig — Squier Factory Codes',
      url: 'https://killerrig.com/squier-factory-codes-serial-number-lookup/',
      kind: 'community',
      note: 'Dealer-compiled lookup covering ICS, ISS, CGS, CN, CY, MN, MZ prefixes.',
    },
    {
      label: 'FUZZFACED — Chinese and Indonesian Stratocasters',
      url: 'https://www.fuzzfaced.net/serial-number-stratocaster-china-indonesia.html',
      kind: 'reference',
      note: 'Deep-dive reference covering the Squier Chinese/Indonesian factory prefixes and their history.',
    },
  ],
  formats: [
    {
      id: 'squier_ics',
      name: 'ICS — Indonesia Cort',
      yearRange: '2009+',
      example: 'ICS19123456',
      rule: 'ICS + 2-digit year + 4-6 digit sequence.',
    },
    {
      id: 'squier_iss',
      name: 'ISS — Indonesia Samick',
      yearRange: 'Varies',
      example: 'ISS21123456',
      rule: 'ISS + 2-digit year + 4-6 digit sequence.',
    },
    {
      id: 'squier_cgs',
      name: 'CGS — China Guangzhou (Classic Vibe)',
      yearRange: '2009+',
      example: 'CGS0912345',
      rule: 'CGS + 2-digit year + 4-6 digit sequence. Predominantly Classic Vibe models.',
    },
    {
      id: 'squier_cn',
      name: 'CN — China Cor-Tek',
      yearRange: 'Varies',
      example: 'CN12123456',
      rule: 'CN + 2-digit year + 4-6 digit sequence.',
    },
    {
      id: 'squier_cy',
      name: 'CY — China CW',
      yearRange: 'Varies',
      example: 'CY11123456',
      rule: 'CY + 2-digit year + 4-6 digit sequence.',
    },
    {
      id: 'squier_ic',
      name: 'IC — Indonesia Cort (shorter prefix)',
      yearRange: 'Varies',
      example: 'IC12123456',
      rule: 'IC + 2-digit year + 4-6 digit sequence (older Squier Indonesia).',
    },
    {
      id: 'squier_si',
      name: 'SI — Indonesia Samick',
      yearRange: 'Varies',
      example: 'SI04123456',
      rule: "SI + 2-digit year + 4-6 digit sequence. Samick's Indonesian plant; same year-prefix layout as the ICS/ISS Indonesian codes.",
    },
    {
      id: 'squier_kc',
      name: 'KC — Korea Cor-Tek',
      yearRange: 'Varies',
      example: 'KC15123456',
      rule: 'KC + 2-digit year + 4-6 digit sequence. Korean Cor-Tek (Cort) production.',
    },
    {
      id: 'squier_kv',
      name: 'KV — Korea Saehan/Sunghan',
      yearRange: 'Varies',
      example: 'KV99123456',
      rule: 'KV + 2-digit year + 4-6 digit sequence. Korean Saehan/Sunghan factory.',
    },
    {
      id: 'squier_vn',
      name: 'VN — Vietnam',
      yearRange: 'Varies',
      example: 'VN05123456',
      rule: 'VN + 2-digit year + 4-6 digit sequence. Vietnamese production.',
    },
    {
      id: 'squier_mn',
      name: 'MN — Mexico (1990s, single-digit year)',
      yearRange: '1990s',
      example: 'MN4123456',
      rule: 'MN + single-digit year (0=1990, 1=1991, …, 9=1999) + 4-6 sequential. Shared with Fender Mexico.',
    },
    {
      id: 'squier_mz',
      name: 'MZ — Mexico (2000s, single-digit year)',
      yearRange: '2000s',
      example: 'MZ5123456',
      rule: 'MZ + single-digit year (0=2000 … 9=2009) + 4-6 sequential. Shared with Fender Mexico.',
    },
    {
      id: 'squier_usa_e',
      name: 'E — USA (1980s)',
      yearRange: '1982–1989',
      example: 'E4123456',
      rule: 'E + single-digit year + 4-5 sequential. Early Squier USA production.',
    },
    {
      id: 'squier_usa_n',
      name: 'N — USA (1990s)',
      yearRange: '1990s',
      example: 'N4123456',
      rule: 'N + single-digit year + 4-5 sequential.',
    },
  ],
  findSerial: {
    intro:
      'Squier serial locations follow the same conventions as the equivalent Fender production — back of the headstock (decade-prefix and modern), neckplate (older USA).',
    locations: [
      {
        place: 'Back of headstock',
        description: 'Standard for ICS, ISS, CGS, CN, CY, IC Indonesian/Chinese production.',
      },
      {
        place: 'Neckplate',
        description: 'Some older USA / Japan production carries the serial on the metal neckplate.',
      },
    ],
  },
};

BRAND_GUIDES['g&l'] = {
  id: 'g&l',
  slug: 'gandl',
  intro:
    "G&L was Leo Fender's company after CBS (and later BBE). Serial numbering split into five eras: G/B-prefix 1980-1997 (guitars/basses, no year encoded), CL transitional 1997-1998, CLF-with-date 1998-2011 (year+month encoded), CLF-cumulative 2011+ (no year in serial), and Placentia China with a full 4-digit year prefix.",
  sources: [
    {
      label: 'G&L Guitars — FAQs (official)',
      url: 'https://glguitars.com/faqs/',
      kind: 'manufacturer',
      note: 'Official G&L FAQ covering serial placement and dating guidance.',
    },
    {
      label: "Guitars by Leo — How do I determine an instrument's age?",
      url: 'https://www.guitarsbyleo.com/FORUM/viewtopic.php?t=19',
      kind: 'community',
      note: 'Canonical community reference documenting the CL/CLF transitions and CLFYYMMnnn layout. G&L historian David McLaren-verified.',
    },
    {
      label: 'Guitars by Leo — Registry',
      url: 'https://www.guitarsbyleo.com/AUTOREG/',
      kind: 'community',
      note: 'Community-maintained G&L registry — best source for year lookup on CLF-cumulative (post-2011) serials.',
    },
  ],
  formats: [
    {
      id: 'gandl_clf_dated',
      name: 'CLF dated (1998–2011)',
      yearRange: '1998–2011',
      example: 'CLF0304012',
      rule: 'CLF + 2-digit year + 2-digit month + 3-digit rank. The "CLF" stands for Clarence Leo Fender. Example CLF0304012 decodes to April 2003, #012.',
    },
    {
      id: 'gandl_clf_cumulative',
      name: 'CLF cumulative (2011+)',
      yearRange: '2011+',
      example: 'CLF123456',
      rule: 'CLF + 6-digit cumulative sequence — date is no longer encoded in the serial. Year lookup requires the Guitars by Leo registry or contacting G&L.',
      gotchas: [
        'In February 2011 G&L moved to a metal-plate serial and dropped the embedded YY/MM.',
      ],
    },
    {
      id: 'gandl_cl_transitional',
      name: 'CL transitional (late 1997–1998)',
      yearRange: 'late 1997 – 1998',
      example: 'CL12345',
      rule: 'CL + 5-digit sequence. Short-lived transitional format before the CLF prefix was adopted.',
    },
    {
      id: 'gandl_g_prefix',
      name: 'G-prefix guitars (1980–1997)',
      yearRange: '1980–1997',
      example: 'G123456',
      rule: 'G + 5-6 digit sequence for guitars. No year encoded; use the Guitars by Leo registry.',
    },
    {
      id: 'gandl_b_prefix',
      name: 'B-prefix basses (1980–1997)',
      yearRange: '1980–1997',
      example: 'B123456',
      rule: 'B + 5-6 digit sequence for basses. No year encoded.',
    },
    {
      id: 'gandl_placentia',
      name: 'Placentia China (YYYY-prefix)',
      yearRange: '2019+',
      example: '20210009',
      rule: "Full 4-digit year prefix + 4-digit sequence. Used on G&L's Placentia-series China production. Example 20210009 = 2021.",
    },
    {
      id: 'gandl_tribute_china',
      name: 'Tribute China (L-prefix)',
      yearRange: 'Varies',
      example: 'L15081234',
      rule: 'L + YY + MM + 4–5 digit sequence. Chinese Tribute Series production. Example L15081234 = August 2015, #1234. Month must be 01–12 for year decoding.',
    },
    {
      id: 'gandl_tribute_indonesia',
      name: 'Tribute Indonesia (9-digit)',
      yearRange: '2003+',
      example: '150812345',
      rule: 'Nine plain digits = YY + MM + 5-digit sequence. Indonesian Tribute Series production. Plausibility gate on YY = 03–29 (Tribute Series launched in the early 2000s) and month = 01–12.',
    },
    {
      id: 'gandl_tribute_korea',
      name: 'Tribute Korea (8-digit)',
      yearRange: '2003+',
      example: '15081234',
      rule: 'Eight plain digits = YY + MM + 4-digit sequence. Korean Tribute Series production. Same YY (03–29) and month (01–12) plausibility gates as the Indonesian variant.',
    },
  ],
  findSerial: {
    intro:
      'Early G&L serials lived on the bridge or neck plate. Modern production carries the CLF serial on the back of the headstock (waterslide decal through 2011, metal plate from February 2011 onward).',
    locations: [
      {
        place: 'Back of headstock',
        description:
          'Standard for all CLF-prefix production; metal plate from Feb 2011 forward, waterslide decal before.',
      },
      {
        place: 'Bridge (1980–1983)',
        description:
          'Earliest G&L serials were stamped on the bridge. Look for an impressed 6-digit number.',
      },
      {
        place: 'Inside neck pocket / neck heel',
        description:
          'The most accurate dating comes from the hand-written date on the neck heel or inside the neck pocket, accessible by removing the neck.',
      },
    ],
  },
};

BRAND_GUIDES.schecter = {
  id: 'schecter',
  slug: 'schecter',
  intro:
    'Schecter serials combine a factory prefix letter (indicating where the guitar was built) with a 2-digit year and a production sequence. The vast majority of Schecter production runs through World Musical Instruments (W prefix) in Incheon, South Korea; smaller lots come from Cort factories in Indonesia (IC/IW) and the Schecter USA Custom Shop in Sun Valley.',
  sources: [
    {
      label: 'Killerrig — Schecter Serial Number and Factory Code Lookup',
      url: 'https://killerrig.com/schecter-serial-number-and-factory-code-lookup/',
      kind: 'community',
      note: 'Comprehensive lookup documenting W, IW, IC, C factory prefixes and the first-two-digits-of-year convention.',
    },
    {
      label: 'Schecter Serial Numbers (Musicians Centre reference)',
      url: 'https://sites.google.com/a/musicianscentre.com/schecter/home/schecter-serial-numbers',
      kind: 'community',
      note: 'Dealer-compiled reference with example serials from multiple factories and decades.',
    },
  ],
  formats: [
    {
      id: 'schecter_factory',
      name: 'Factory-prefix (W / IW / IC / C / S)',
      yearRange: '2000+',
      example: 'W10052743',
      rule: 'Factory letter(s) + 2-digit year + 3-7 digit production sequence. W = World Musical Instruments (Korea) is the most common. IW/IC = Indonesia (World or Cort). C = Cort Korea. S = Schecter. Example W10052743 = 2010 World Korea.',
    },
    {
      id: 'schecter_numeric',
      name: 'No-prefix numeric',
      yearRange: '2000+',
      example: '0236758',
      rule: 'YY + 4-6 digit sequence. Older Schecter serials sometimes omit the factory prefix. Example 0236758 = 2002.',
    },
  ],
  findSerial: {
    intro: 'Modern Schecter serials are impressed or decaled on the back of the headstock.',
    locations: [
      {
        place: 'Back of headstock',
        description: 'Standard location for all modern Schecter production.',
      },
    ],
  },
};

BRAND_GUIDES.martin = {
  id: 'martin',
  slug: 'martin',
  intro:
    "C.F. Martin & Co. has kept impeccable serial records since 1898, making any Martin guitar straightforward to date via its year-end chart. The serial is impressed on the neck block inside the body (look through the soundhole toward the neck). The system starts at 8,348 in 1898 — Martin's estimate of its cumulative pre-numbering production.",
  sources: [
    {
      label: 'C.F. Martin — Dating Your Martin (official)',
      url: 'https://www.martinguitar.com/support-serial-number-lookup.html',
      kind: 'manufacturer',
      note: "Martin's official serial chart with year-end cumulative totals from 1898 through current production.",
    },
    {
      label: 'Reverb — Dating Martin Guitars by Serial Number',
      url: 'https://reverb.com/news/dating-martin-guitars-by-serial-number',
      kind: 'reference',
      note: 'In-depth article covering the Sigma-Martin exception, the mandolin-merge in 1991, and the nonstandard electric E18.',
    },
    {
      label: 'Vintage Guitars Info — Martin Dating',
      url: 'https://guitarhq.com/martin.html',
      kind: 'reference',
      note: 'Comprehensive community reference with full year-by-year chart and detailed pre-1898 and model-specific notes.',
    },
  ],
  formats: [
    {
      id: 'martin_sequential',
      name: 'Sequential (1898+)',
      yearRange: '1898+',
      example: '800000',
      exampleYear: 2001,
      rule: "Purely-numeric sequential serial impressed on the neck block. The decoder binary-searches Martin's year-end chart to pin the build year. Starting serial for 1898 is 8,348.",
      gotchas: [
        'Serial numbers 900001–902908 were used on Sigma-Martin (licensed 1981-1982 imports) and are not Martin-branded; the decoder rejects them.',
        "Martin mandolins pre-1991 used a separate sequence; we don't distinguish mandolins from guitars here.",
        "Martin's rare electric E18 and some signature models don't use the sequential chart.",
        'Backpacker and Little Martin (LX) have their own sequences; this decoder covers the main guitar/ukulele chart only.',
      ],
    },
  ],
  findSerial: {
    intro:
      'The Martin serial is stamped on the neck block inside the body. Look through the soundhole toward the neck; the number is impressed into the wood on the forward face of the neck block.',
    locations: [
      {
        place: 'Neck block (inside body)',
        description:
          'Universal Martin serial location. Look through the soundhole toward the neck — the number is on the wooden block at the join.',
      },
    ],
  },
};

BRAND_GUIDES.esp = {
  id: 'esp',
  slug: 'esp',
  intro:
    "ESP is a complex brand to date because the company's own records pre-2000 are incomplete — ESP Japan lost many records in a late-1990s factory fire. What remains well-documented is the post-2000 import format where a letter prefix identifies the factory (Korea, China, Vietnam, or Indonesia). Year encoding within the digits varies by factory and isn't uniformly published, so the decoder recognizes the format but leaves year null.",
  sources: [
    {
      label: 'Guitars Collector — ESP Serial Numbers',
      url: 'https://www.guitarscollector.com/esp-serial-numbers.html',
      kind: 'community',
      note: 'Reference documenting ESP/LTD factory letter codes: E/U = Korea, L = China, I = Vietnam, W = World Korea, IS/IR/IW/IX = Indonesia.',
    },
    {
      label: 'Killerrig — ESP LTD Serial Number Decoding',
      url: 'https://killerrig.com/esp-serial-number-decoding-ltd-guitars/',
      kind: 'community',
      note: 'Additional factory-code reference plus notes on pre-2000 limitations.',
    },
  ],
  sourceNote:
    'ESP explicitly acknowledges that many pre-2000 records were destroyed in a factory fire and dating instruments from that era via serial alone is often impossible. For pre-2000 instruments, physical inspection (pickups, hardware, logo style) is usually required.',
  formats: [
    {
      id: 'esp_import',
      name: 'Letter-prefix import (2000+)',
      yearRange: '2000+',
      example: 'E1234567',
      rule: 'Single letter factory code + 7 digits (E/U = ESP Korea, L = China, I = Vietnam) or two letters + 7-8 digits (IS/IR = Indonesia, IW/IX = Indonesia World, plus some 8-digit Indonesia variants). Year encoding within the digits varies.',
      gotchas: [
        'Year decoding is not consistently documented across factories — we match the format and leave decoded year null.',
      ],
    },
    {
      id: 'esp_world_korea',
      name: 'W-prefix (World Korea, 8 digits)',
      yearRange: 'Varies',
      example: 'W12345678',
      rule: 'W + 8 digits. World Musical Instrument Co., Incheon, Korea — a major ESP/LTD contract factory.',
    },
    {
      id: 'esp_pre2000_japan',
      name: 'Pre-2000 Japan date-coded (DDMMYNNN)',
      yearRange: '1975–1999',
      example: '25055012',
      rule: '8-digit numeric: DD + MM + Y + NNN. DD = day of month (01-31), MM = month (01-12), Y = last digit of year, NNN = daily production rank. Example 25055012 = May 25th, year ending in 5, build #12.',
      gotchas: [
        'The single-digit year is ambiguous without additional context. The decoder snaps to the closest plausible decade in 1975-1999 using the listing year; without a listing year it leaves year null.',
        'ESP Japan lost many pre-2000 production records in a late-1990s factory fire — physical inspection (pickups, hardware, logo style) is often required to confirm decade.',
      ],
    },
  ],
  findSerial: {
    intro:
      'Modern ESP and LTD serials live on the back of the headstock. Pre-2000 ESPs had the serial in varied locations.',
    locations: [
      {
        place: 'Back of headstock (post-2000)',
        description: 'Standard for all modern ESP and LTD production.',
      },
      {
        place: 'Varies (pre-2000)',
        description:
          'Inside body on hollowbodies, neck plate on some solidbodies, neck pocket on others. Physical inspection required.',
      },
    ],
  },
};

BRAND_GUIDES['music man'] = {
  id: 'music man',
  slug: 'music-man',
  intro:
    "Ernie Ball Music Man uses a relatively simple sequential numbering system, but the serial itself doesn't cleanly encode the year. Dating EB Music Man instruments is best done via EB's official Serial Number Database — the decoder here recognizes the format and then points users to the canonical lookup.",
  sources: [
    {
      label: 'Ernie Ball Music Man — Serial Number Database (official)',
      url: 'https://www.music-man.com/serial-number-database',
      kind: 'manufacturer',
      note: "EB's official database — the authoritative way to date an Ernie Ball Music Man instrument.",
    },
    {
      label: 'Ernie Ball Forums — Serial Number Search Tool and Info',
      url: 'https://forums.ernieball.com/threads/serial-number-search-tool-and-info.69056/',
      kind: 'community',
      note: 'Official Ernie Ball forum thread with decoding notes and serial-location guidance.',
    },
    {
      label: 'Music Man Bass Global — Serials Pre-EB Sting Ray',
      url: 'http://www.musicmanbass.global/serials-pre-eb-sting-ray/',
      kind: 'community',
      note: 'Deep-dive community reference for pre-EB era (Leo Fender-era Music Man) serials.',
    },
  ],
  sourceNote:
    "Music Man serials don't encode the year reliably. The most accurate build date is written in the neck pocket or on the neck heel. Use EB's official database or email customer service for a definitive answer.",
  formats: [
    {
      id: 'musicman_b_prefix',
      name: 'B-prefix (mid-1980s+)',
      yearRange: '1986+',
      example: 'B027100',
      rule: 'B + 6-digit serial. Introduced with the Ernie Ball era (1984+). Date via the EB database.',
    },
    {
      id: 'musicman_f_prefix',
      name: 'F-prefix',
      yearRange: 'Varies',
      example: 'F12345',
      rule: 'F + 5-digit serial. Seen on various EB models; date via the EB database.',
    },
    {
      id: 'musicman_5digit',
      name: '5-digit 8xxxx / 9xxxx (1985+)',
      yearRange: '1985+',
      example: '85123',
      rule: '5-digit serial starting with 8 or 9. 8xxxx = EVH / Axis guitars (later also others). 9xxxx = Steve Morse, Albert Lee, Luke, Silhouette, Silhouette Specials. Date via the EB database.',
    },
  ],
  findSerial: {
    intro:
      'Music Man serial locations changed over time. 1985-1989 serials are stamped on the back of the headstock under the G-string tuner. 1990+ moved to the neckplate. The most accurate build date is hand-written in the neck pocket or on the neck heel.',
    locations: [
      {
        place: 'Back of headstock (1985-1989)',
        description: 'Under the G-string tuner. Early Ernie Ball era.',
      },
      {
        place: 'Neckplate (1990+)',
        description:
          'Bottom of the neckplate between the two lowest screws. Post-1998 often imprinted into the metal.',
      },
      {
        place: 'Bridge plate (early 1990s)',
        description: 'Some early-1990s instruments had the serial on the bridge plate.',
      },
      {
        place: 'Neck pocket / neck heel (authoritative date)',
        description: 'The most accurate build date is hand-written here. Requires neck removal.',
      },
    ],
  },
};

/**
 * Organizational metadata layered on top of the format definitions above.
 * Keeping it here rather than inline on every format means we can re-read
 * prose in one pass and re-order / re-group organization in another, and
 * it keeps the primary data (rule / gotchas / sources) uncluttered.
 *
 * `era` clusters related formats on the brand page so readers can scan by
 * production period / country / line. Brands with fewer formats can skip
 * eras entirely and render flat.
 *
 * `primary` flags the formats that cover the bulk of real-world serials
 * a visitor today is likely to be holding. Non-primary formats tuck into
 * a "Less common variants" disclosure so common cases stay scannable.
 */
const FORMAT_META: Record<string, { era?: string; primary?: boolean }> = {
  // ---- Gibson ----
  gibson_yddd_yrrr: { era: 'Modern era (1977+)', primary: true },
  gibson_yddd_ybrrr: { era: 'Modern era (1977+)', primary: true },
  gibson_yy_sequential: { era: 'Modern era (1977+)', primary: true },
  gibson_1975_1977: { era: 'Modern era (1977+)' },
  gibson_pre1977: { era: 'Pre-1977 (paper labels, FON, die-stamped)' },
  gibson_a_series: { era: 'Pre-1977 (paper labels, FON, die-stamped)' },
  gibson_fon_letter: { era: 'Pre-1977 (paper labels, FON, die-stamped)' },
  gibson_pre1961: { era: 'Pre-1977 (paper labels, FON, die-stamped)' },
  gibson_lp_classic_1989_1999: { era: 'Les Paul Classic ink-stamp' },
  gibson_lp_classic_2000_2014: { era: 'Les Paul Classic ink-stamp' },

  // ---- Gibson Custom Shop ----
  gibson_cs: { primary: true },
  gibson_cs_yyrrrr: { primary: true },
  gibson_cs_historic: { primary: true },

  // ---- Fender ----
  fender_us_prefix: { era: 'Modern USA (2000+)', primary: true },
  fender_avri_v_prefix: { era: 'Modern USA (2000+)' },
  fender_s_prefix: { era: 'USA decade prefixes (1976–2000)' },
  fender_e_prefix: { era: 'USA decade prefixes (1976–2000)' },
  fender_n_prefix: { era: 'USA decade prefixes (1976–2000)', primary: true },
  fender_z_prefix: { era: 'USA decade prefixes (1976–2000)' },
  fender_dz_prefix: { era: 'USA decade prefixes (1976–2000)' },
  fender_dn: { era: 'USA decade prefixes (1976–2000)' },
  fender_mx: { era: 'Mexico', primary: true },
  fender_mn: { era: 'Mexico' },
  fender_mz: { era: 'Mexico' },
  fender_vs: { era: 'Mexico' },
  fender_jd: { era: 'Japan', primary: true },
  fender_japan_jv: { era: 'Japan' },
  fender_japan_sq: { era: 'Japan' },
  fender_l_series: { era: 'Pre-1976 USA' },
  fender_pre1976_neckplate: { era: 'Pre-1976 USA' },
  fender_neckplate: { era: 'Pre-1976 USA' },
  fender_avri_bridge: { era: 'Pre-1976 USA' },
  fender_cs: { era: 'Custom Shop' },
  fender_cs_masterbuilt: { era: 'Custom Shop' },
  fender_cs_time_machine: { era: 'Custom Shop' },
  fender_cs_american_custom: { era: 'Custom Shop' },
  fender_cz: { era: 'Custom Shop' },
  fender_mod_shop: { era: 'Custom Shop' },

  // ---- PRS ----
  prs_core: { era: 'Main line', primary: true },
  prs_core_pre2008: { era: 'Main line', primary: true },
  prs_s2: { era: 'Main line', primary: true },
  prs_ce: { era: 'Main line' },
  prs_eg: { era: 'Vintage model lines' },
  prs_swamp_ash: { era: 'Vintage model lines' },
  prs_bass_bolt_on: { era: 'Bass' },
  prs_bass_set_neck: { era: 'Bass' },
  prs_bass_electric: { era: 'Bass' },
  prs_se_korea: { era: 'SE / imports', primary: true },
  prs_ia: { era: 'SE / imports' },
  prs_cti: { era: 'SE / imports' },
  prs_acoustic: { era: 'Acoustic' },

  // ---- Heritage ----
  heritage_single: { era: 'Letter-year (1985–2025)', primary: true },
  heritage_double: { era: 'Letter-year (1985–2025)', primary: true },
  heritage_standard: { era: 'Modern numeric (2020+)' },
  heritage_cs: { era: 'Modern numeric (2020+)' },
  heritage_numeric_6: { era: 'Kalamazoo stamp (undocumented)' },

  // ---- Sire ----
  sire_gen1: { primary: true },
  sire_gen2: { primary: true },

  // ---- Ibanez ----
  ibanez_japan_f: { era: 'Japan (Fujigen)', primary: true },
  ibanez_japan_letter_month: { era: 'Japan (Fujigen)' },
  ibanez_korea: { era: 'Korea', primary: true },
  ibanez_korea_samick: { era: 'Korea' },
  ibanez_korea_world: { era: 'Korea' },
  ibanez_indonesia: { era: 'Indonesia', primary: true },
  ibanez_indonesia_kwo_hsiao: { era: 'Indonesia' },
  ibanez_indonesia_samick: { era: 'Indonesia' },

  // ---- Gretsch ----
  gretsch_modern: { primary: true },
  gretsch_date_coded_1966_1972: { primary: true },

  // ---- Rickenbacker ----
  rickenbacker_1987_1996: { era: 'Modern (1987+)', primary: true },
  rickenbacker_1996_plus: { era: 'Modern (1987+)', primary: true },
  rickenbacker_1961_1986: { era: 'Pre-1987', primary: true },
  rickenbacker_pre1961: { era: 'Pre-1987' },
  rickenbacker_1960_jk_jl: { era: 'Pre-1987' },

  // ---- Jackson ----
  jackson_modern_import: { era: 'Modern (1996+)', primary: true },
  jackson_mii_india: { era: 'Modern (1996+)' },
  jackson_mij_1996_plus: { era: 'Modern (1996+)', primary: true },
  jackson_mij_professional: { era: 'Vintage' },
  jackson_usa: { era: 'Vintage' },
  jackson_rr_signature: { era: 'Vintage' },

  // ---- Charvel ----
  charvel_japan: { primary: true },
  charvel_san_dimas: { primary: true },

  // ---- Epiphone ----
  epiphone_factory: { primary: true },
  epiphone_numeric: { primary: true },

  // ---- Squier ----
  squier_ics: { era: 'Indonesia', primary: true },
  squier_iss: { era: 'Indonesia' },
  squier_ic: { era: 'Indonesia' },
  squier_si: { era: 'Indonesia' },
  squier_cgs: { era: 'China', primary: true },
  squier_cn: { era: 'China' },
  squier_cy: { era: 'China' },
  squier_kc: { era: 'Korea' },
  squier_kv: { era: 'Korea' },
  squier_vn: { era: 'Vietnam' },
  squier_mn: { era: 'Mexico (Fender-shared)' },
  squier_mz: { era: 'Mexico (Fender-shared)' },
  squier_usa_e: { era: 'USA (vintage)' },
  squier_usa_n: { era: 'USA (vintage)' },

  // ---- G&L ----
  gandl_clf_dated: { era: 'CLF era', primary: true },
  gandl_clf_cumulative: { era: 'CLF era', primary: true },
  gandl_cl_transitional: { era: 'CLF era' },
  gandl_g_prefix: { era: 'Legacy (1980–1997)' },
  gandl_b_prefix: { era: 'Legacy (1980–1997)' },
  gandl_tribute_china: { era: 'Tribute imports' },
  gandl_tribute_indonesia: { era: 'Tribute imports' },
  gandl_tribute_korea: { era: 'Tribute imports' },
  gandl_placentia: { era: 'Tribute imports' },

  // ---- Schecter ----
  schecter_factory: { primary: true },
  schecter_numeric: { primary: true },

  // ---- Martin ----
  martin_sequential: { primary: true },

  // ---- ESP / LTD ----
  esp_import: { primary: true },
  esp_world_korea: {},
  esp_pre2000_japan: {},

  // ---- Ernie Ball Music Man ----
  musicman_b_prefix: { primary: true },
  musicman_f_prefix: {},
  musicman_5digit: { primary: true },
};

// Decorate every known format with its organizational metadata. Done once
// at module load so consumers just read `.era` / `.primary` off each
// format without an extra indirection.
for (const guide of Object.values(BRAND_GUIDES)) {
  for (const format of guide.formats) {
    const meta = FORMAT_META[format.id];
    if (!meta) continue;
    if (meta.era !== undefined) format.era = meta.era;
    if (meta.primary !== undefined) format.primary = meta.primary;
  }
}

export function getBrandGuide(slug: string): BrandGuide | undefined {
  return Object.values(BRAND_GUIDES).find((g) => g.slug === slug);
}
