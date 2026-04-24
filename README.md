# guitarserials.org

A reference for guitar serial numbers — 18 makers and a century of manufacturing, decoded in the browser.

The goal is to replace scattered forum posts and thin printed references with one well-researched, source-cited tool. The matcher is pure TypeScript with zero runtime dependencies. The site is a static Astro build. Every decode runs in your browser; nothing is uploaded, nothing is logged.

- **Live:** [guitarserials.org](https://guitarserials.org)
- **Library:** [`@guitarserials/core`](./packages/core) — drop the decoder into your own dealer tool or appraisal workflow
- **License:** MIT

## Supported brands

Gibson · Gibson Custom Shop · Fender · PRS · Heritage · Sire · Ibanez · Gretsch · Rickenbacker · Jackson · Charvel · Epiphone · Squier · G&L · Schecter · Martin · ESP / LTD · Ernie Ball Music Man.

Across these 18 makers the decoder ships 115 distinct format rules covering 1902–present. Each rule traces to at least two authoritative sources (manufacturer docs where available, then reference books, registries, and curated community wikis). See [`/methodology`](https://guitarserials.org/methodology) for the confidence-tier model and the sourcing standard.

## Repo layout

```
packages/core   — @guitarserials/core: the decoder library (TS, zero runtime deps)
apps/web        — Astro + React islands, the static site at guitarserials.org
doc/            — plan, audits, launch notes (gitignored; private workspace)
```

## Quick start

Requires Node 22 and pnpm 10.

```sh
pnpm install
pnpm test         # vitest (core) + playwright (web e2e)
pnpm typecheck
pnpm lint
pnpm --filter @guitarserials/web dev
```

## Using the library

```ts
import { matchSerial } from '@guitarserials/core';

const result = matchSerial('CS500123', 'gibson custom shop', { listingYear: 2015 });
// result.decodedYear        → 2015
// result.brandFormat        → 'gibson_cs'
// result.confidenceTier     → 'high'
// result.candidates         → every structurally valid interpretation considered
```

The signature is `matchSerial(serial, brand, options?)` where `brand` is one of the brand ids in `SUPPORTED_BRANDS`. Options cover `listingYear` (for cross-validation and single-digit-year disambiguation) and `modelHint` (for format gating — e.g. "Les Paul Reissue R9" unlocks the historic-reissue rule under plain "Gibson"). See [`packages/core/src/types.ts`](./packages/core/src/types.ts) for the full `SerialMatch` shape.

## Privacy

No analytics, no tracking, no cookies — by design. The site does not ship JavaScript that contacts third-party analytics providers. Every decode is a pure function of the text you paste into the input.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the sourcing standard. Every new format rule needs:

1. At least two independent authoritative sources, cited in both the brand guide (`apps/web/src/lib/brandGuides.ts`) and as a unit test comment.
2. Unit tests covering the rule and at least one plausible collision case (the test suite prevents regressions when new rules are added).
3. A human-readable entry in `apps/web/src/lib/formatDescriptions.ts`.

If the decoder got a specific serial wrong, the fastest path to a fix is an [incorrect-decode report](https://github.com/onemorepereira/guitarserials.org/issues/new?template=incorrect_decode.md).

## License

[MIT](./LICENSE). Use it, fork it, embed the decoder anywhere — attribution appreciated but not required.
