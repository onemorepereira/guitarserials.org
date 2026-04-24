export interface BrandMeta {
  /** Normalized brand id passed to @guitarserials/core. */
  id: string;
  /** URL-safe slug (no spaces). */
  slug: string;
  /** Human display label. */
  label: string;
  /** One-line blurb shown on the home page brand card. */
  blurb: string;
}

/** v1 brands the decoder supports — order determines UI display order. */
export const BRANDS: BrandMeta[] = [
  {
    id: 'gibson',
    slug: 'gibson',
    label: 'Gibson',
    blurb: '8/9-digit + CS + artist runs',
  },
  {
    id: 'gibson custom shop',
    slug: 'gibson-custom-shop',
    label: 'Gibson Custom Shop',
    blurb: 'CS, historic reissues, R-series',
  },
  {
    id: 'fender',
    slug: 'fender',
    label: 'Fender',
    blurb: 'US/MX/JD + decade prefixes',
  },
  { id: 'prs', slug: 'prs', label: 'PRS', blurb: 'Core, CE, S2, CTI Indonesia' },
  {
    id: 'heritage',
    slug: 'heritage',
    label: 'Heritage',
    blurb: 'Single/double letter + HC',
  },
  { id: 'sire', slug: 'sire', label: 'Sire', blurb: 'Gen 1 & Gen 2' },
  {
    id: 'ibanez',
    slug: 'ibanez',
    label: 'Ibanez',
    blurb: 'Fujigen F, letter-month, Korea/Indonesia',
  },
  {
    id: 'gretsch',
    slug: 'gretsch',
    label: 'Gretsch',
    blurb: 'Modern JT/KS factory codes, 1966-72 date-coded era',
  },
  {
    id: 'rickenbacker',
    slug: 'rickenbacker',
    label: 'Rickenbacker',
    blurb: 'Letter-month + year-digit (1987+)',
  },
  {
    id: 'jackson',
    slug: 'jackson',
    label: 'Jackson',
    blurb: 'ICJ/CYJ modern imports, MIJ Professional',
  },
  {
    id: 'charvel',
    slug: 'charvel',
    label: 'Charvel',
    blurb: 'JC Japan modern, San Dimas USA 1981-86',
  },
  {
    id: 'epiphone',
    slug: 'epiphone',
    label: 'Epiphone',
    blurb: 'Factory + YY + MM + seq (1993-2008); all-numeric since 2008',
  },
  {
    id: 'squier',
    slug: 'squier',
    label: 'Squier',
    blurb: 'ICS/ISS/CGS/CN/CY factory prefixes + Fender-shared formats',
  },
  {
    id: 'g&l',
    slug: 'gandl',
    label: 'G&L',
    blurb: 'CLF YY MM (1998+), legacy G/B prefixes, Placentia China',
  },
  {
    id: 'schecter',
    slug: 'schecter',
    label: 'Schecter',
    blurb: 'First two digits of YY + optional factory prefix',
  },
  {
    id: 'martin',
    slug: 'martin',
    label: 'Martin',
    blurb: 'Sequential since 1898; official year-end chart lookup',
  },
  {
    id: 'esp',
    slug: 'esp',
    label: 'ESP / LTD',
    blurb: 'E/U/I/L/W/IS/IR/IW/IX factory letter prefixes',
  },
  {
    id: 'music man',
    slug: 'music-man',
    label: 'Ernie Ball Music Man',
    blurb: 'B-prefix, 5-digit 8xxx/9xxx; database lookup for dating',
  },
];

export function findBrand(idOrSlug: string): BrandMeta | undefined {
  return BRANDS.find((b) => b.id === idOrSlug || b.slug === idOrSlug);
}
