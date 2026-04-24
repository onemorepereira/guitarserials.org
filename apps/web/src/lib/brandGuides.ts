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
      "Gibson's serial numbering has shifted several times since the 1950s, and the format alone doesn't always pin down a year — but for the 1977-onward eras the year is usually encoded directly in the digits. Earlier serials (pre-1977) are sequential with no year encoded, and the best way to date them is by comparing the serial to a factory-run reference.",
    eraPara:
      'The modern format (1977 onward) encodes the year in the first and fifth digits of an 8- or 9-digit serial. A brief period from 2014 to mid-2019 used a simpler YYNNNNNNN layout. Pre-1977 Gibson USA serials are sequential, and pre-1961 student-line models (Junior, Special, Melody Maker) were ink-stamped with a 4-digit factory order number.',
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
        rule: 'Sequential serial with no year encoded in the digits. Dating requires cross-referencing a factory-run chart.',
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
        yearRange: 'Any',
        example: '12345',
        exampleYear: 2020,
        exampleModelHint: 'Les Paul Standard Historic',
        rule: 'Pure 5- or 6-digit sequential numbers on Historic Reissue / R-series / Murphy Lab Les Pauls. No year encoded — a listing year and a model hint (Reissue, R0/R4/R7/R8/R9, Historic, Murphy Lab, or Custom Shop) are required to claim this format.',
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
      'Fender has used many serial formats across its factories (USA, Mexico, Japan, Korea, Indonesia). Most post-1976 formats encode the year directly in the serial — either in the first letter of a decade-prefix, in the first digit (DN/MZ/MN-style), or in the first two digits (US/MX/JD/VS/MS-style). Several Custom Shop formats (V, CS, CZ, R, XN, HR) are definitive prefixes with no year encoded.',
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
        id: 'fender_v_prefix',
        name: 'V-prefix (AVRI, American Vintage Reissue)',
        yearRange: 'Any',
        example: 'V123456',
        rule: 'V followed by 4–7 digits. No year encoded in the serial — the prefix alone is definitive.',
      },
      {
        id: 'fender_cs',
        name: 'CS-prefix (Custom Shop)',
        yearRange: 'Any',
        example: 'CS123456',
        rule: 'Fender Custom Shop 5–6 digit serials. No year encoded.',
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
        id: 'fender_neckplate',
        name: 'Neck-plate 8-digit (1965–1976)',
        yearRange: '1965–1976',
        example: '12345678',
        rule: 'Pre-1977 Fender USA 8-digit numeric stamped on the neck plate. No year encoded; dating requires a reference chart.',
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
        label: 'PRS — Year Identification',
        url: 'https://support.prsguitars.com/hc/en-us/articles/4408314427547-Year-Identification',
        kind: 'manufacturer',
        note: "PRS Guitars' official article documenting the year-prefix convention across Set-Neck, CE, Acoustic, and S2 models.",
      },
      {
        label: 'PRS — When was my PRS Guitar built?',
        url: 'https://support.prsguitars.com/hc/en-us/articles/4408350481179-When-was-my-PRS-Guitar-built',
        kind: 'manufacturer',
        note: 'Companion article describing serial-number placement by model and the year-prefix rule.',
      },
      {
        label: 'Hendrix Guitars — PRS Set-Neck Sequential Serial Numbers',
        url: 'https://www.hendrixguitars.com/PRS.htm',
        kind: 'reference',
        note: 'Canonical cumulative-production-range table (1985–2006+) for disambiguating single-digit-year PRS serials across decades.',
      },
    ],
    formats: [
      {
        id: 'prs_core_pre2008',
        name: 'Core / CE pre-2008 single-digit year (1985–2007)',
        yearRange: '1985–2007',
        example: '612345',
        rule: 'Single-digit year prefix + 4–6 sequential digits. The leading digit is the last digit of the production year — so 6 could be 1986, 1996, or 2006. Unambiguous dating requires the cumulative-production-range table maintained on community references (hendrixguitars.com).',
        gotchas: [
          'We match the format but leave the year undecoded — deterministic dating requires the full cumulative-range lookup table, which we have not baked into the matcher.',
          'With a listing year provided, the confidence-cap rule gives a usable high-confidence signal; without one, the year is left null.',
        ],
        sources: [
          {
            label: 'Hendrix Guitars — PRS Set-Neck Sequential Serial Numbers',
            url: 'https://www.hendrixguitars.com/PRS.htm',
            kind: 'reference',
            note: 'Authoritative cumulative-production-range table (1985–2006+) — the canonical way to disambiguate single-digit-year PRS serials across decades.',
          },
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
        name: 'S2 Series (2013+)',
        yearRange: '2013+',
        example: 'S2123456',
        rule: 'S2 followed by 6–7 digits. The sequence is cumulative across years — year is inferrable from production ranges (e.g. 2013 = S2000001–S2003820; 2014+ = S2003821+), but the matcher does not bake in the annual ranges and returns year-null.',
        gotchas: [
          'Year is not currently decoded from the serial. Provide a listing year for cross-validation.',
        ],
      },
      {
        id: 'prs_ce',
        name: 'CE-prefix stamp',
        yearRange: 'Varies',
        example: 'CE123456',
        rule: 'CE + 4–6 digit sequential rank. Uncommon — most CE models carry a standard year-prefixed serial on the neck plate (caught by the pre-2008 or 2008+ rules above). This branch covers the rarer CE-prefixed stamped variant and is kept pending photographic confirmation.',
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
          'Letters X, Y, Z (2023+) are not yet confirmed publicly and are not accepted.',
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
        name: 'Single-letter (B–Z)',
        yearRange: '1985–2009',
        example: 'H12345',
        rule: 'Single letter B–Z followed by 5 digits. B = 1985, C = 1986, …, Z = 2009 (no letters skipped).',
      },
      {
        id: 'heritage_double',
        name: 'Double-letter (AA–AP)',
        yearRange: '2010–2025',
        example: 'AA12345',
        rule: 'A followed by a second letter A–P and 5 digits. Second letter increments from A (2010) through the alphabet: AA = 2010, AB = 2011, …, AP = 2025.',
        gotchas: [
          'Earlier decoders assumed a "double-the-letter" scheme (AA/BB/CC/...) which is wrong — the sequence is A-followed-by-any-letter.',
          'Capped at AP (2025) because that is the last letter in Heritage\'s official "Date Your Heritage" dropdown. AQ and later are not accepted until the manufacturer publishes confirmation.',
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
        example: 'I16060221',
        rule: 'I followed by 8 digits = YY + MM + 5-digit sequence (e.g. I16060221 = June 2016, #221). 7 or 9 digit variants fall back to year-unknown.',
        gotchas: [
          'Month must be 01-12 for the 8-digit branch to decode year; otherwise the serial falls back to year-unknown.',
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
    "Rickenbacker has used a small number of well-defined serial schemes since the 1950s. The cleanest era for automated decoding runs from November 1987 onward, where the first character encodes the month and the second a year digit. Pre-1987 serials are model-coded and don't follow a single rule — collector references are usually required.",
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
      rule: 'Three-letter factory code + 2-digit year + 5-digit sequence. Factory codes: ICJ = Indonesia Cort, CYJ = China Yako, CJ = China (generic), MJ / XJ = Mexico, CUJ = China Unsung, ISJ = Indonesia Samick. Example ICJ1500001 = Indonesia Cort, 2015, #1.',
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
    "Charvel (Jackson's sister brand) has two main serial eras: the pre-1986 San Dimas USA era used plain sequential 4-digit numbers. Modern Japan Charvel production uses a JC prefix followed by YY and a sequential number.",
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

export function getBrandGuide(slug: string): BrandGuide | undefined {
  return Object.values(BRAND_GUIDES).find((g) => g.slug === slug);
}
