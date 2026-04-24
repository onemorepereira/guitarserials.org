# @guitarserials/core

Guitar serial-number decoder. Pure TypeScript, zero runtime dependencies. Ships as an ES module with full type declarations.

Powers the decoder at [guitarserials.org](https://guitarserials.org). Drop it into your own dealer tool, appraisal workflow, or listing-validation pipeline.

## Install

```sh
pnpm add @guitarserials/core
# or npm install @guitarserials/core
```

## Use

```ts
import { matchSerial } from '@guitarserials/core';

const result = matchSerial('CS500123', 'gibson custom shop', { listingYear: 2015 });
// result.decodedYear        → 2015
// result.brandFormat        → 'gibson_cs'
// result.confidenceTier     → 'high'
// result.candidates         → every structurally valid interpretation considered
```

`matchSerial(serial, brand, options?)` — where `brand` is one of the ids in `SUPPORTED_BRANDS`:

| Brand | ID |
|---|---|
| Gibson | `gibson` |
| Gibson Custom Shop | `gibson custom shop` |
| Fender | `fender` |
| PRS | `prs` |
| Heritage | `heritage` |
| Sire | `sire` |
| Ibanez | `ibanez` |
| Gretsch | `gretsch` |
| Rickenbacker | `rickenbacker` |
| Jackson | `jackson` |
| Charvel | `charvel` |
| Epiphone | `epiphone` |
| Squier | `squier` |
| G&L | `g&l` |
| Schecter | `schecter` |
| Martin | `martin` |
| ESP | `esp` |
| LTD | `ltd` |
| Ernie Ball Music Man | `music man` |

Options:

- `listingYear?: number` — cross-validates the decoded year against context (e.g. from a Reverb listing). Drives the confidence tier: within 1 year = `high`, 2–5 off = `review`, >5 = `rejected`. Also used to resolve decade ambiguity for single-digit-year formats (Gibson CS, Rickenbacker 1996+, ESP pre-2000, G&L Tribute, etc.).
- `modelHint?: string` — free-form model string (e.g. `"Les Paul Reissue R9"`, `"American Vintage '52 Telecaster"`). Used to gate model-specific rules — the Gibson Custom Shop historic-reissue rule, for instance, only fires when the hint clearly names an R-series / Historic / Murphy Lab instrument.

The full `SerialMatch` shape is in [`src/types.ts`](./src/types.ts).

## Methodology

Every format rule traces to at least two authoritative sources (manufacturer documentation where it exists, then reference books, registries, and long-running community wikis). Every rule has unit tests. See the [methodology page](https://guitarserials.org/methodology) for the confidence-tier model and the sourcing standard.

## License

MIT. Attribution appreciated but not required.
