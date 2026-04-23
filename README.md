# guitarserials.org

A free, accurate, open-source guitar serial-number decoder.

The goal is a single well-researched community reference that replaces scattered forum posts and outdated PDFs. The matcher is pure TypeScript, the site is static, and everything runs in the browser — no backend, no cost per request, works offline after first load.

## What's in this repo

```
packages/core   — @guitarserials/core: the decoder library (TS, no runtime deps)
apps/web        — Astro + React islands static site served at guitarserials.org
infra/aws       — AWS CDK stack (S3 + CloudFront + Route 53)
```

## Quick start

Requires Node 22 and pnpm 9.

```sh
pnpm install
pnpm test         # runs all package tests
pnpm typecheck
pnpm lint
```

## Using the library

```ts
import { matchSerial } from '@guitarserials/core';

const result = matchSerial('CS500123', 'gibson', { listingYear: 2015 });
// → { year: 2015, tier: 'high', formatName: 'Gibson Custom Shop ... ', ... }
```

## Supported brands (v1)

Gibson, Gibson Custom Shop, Fender, PRS, Heritage, Sire, Ibanez.

Phase 2 candidates: Martin, Gretsch, image OCR for serial photos.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). New brand submissions require at least two authoritative sources cited per format claim, plus test cases for every rule.

## License

[MIT](./LICENSE).
