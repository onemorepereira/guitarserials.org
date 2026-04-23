export interface BrandMeta {
  id: string;
  label: string;
  blurb: string;
}

/** v1 brands the decoder supports — order determines UI display order. */
export const BRANDS: BrandMeta[] = [
  { id: 'gibson', label: 'Gibson', blurb: '8/9-digit + CS + artist runs' },
  { id: 'gibson custom shop', label: 'Gibson Custom Shop', blurb: 'CS, historic, R-series' },
  { id: 'fender', label: 'Fender', blurb: 'US/MX/JD + decade prefixes' },
  { id: 'prs', label: 'PRS', blurb: 'Core, CE, S2, CTI Indonesia' },
  { id: 'heritage', label: 'Heritage', blurb: 'Single/double letter + HC' },
  { id: 'sire', label: 'Sire', blurb: 'Gen 1 & Gen 2' },
  { id: 'ibanez', label: 'Ibanez', blurb: 'Fujigen F, letter-month, Korea/Indonesia' },
];

export function findBrand(id: string): BrandMeta | undefined {
  return BRANDS.find((b) => b.id === id);
}
