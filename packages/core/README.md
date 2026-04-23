# @guitarserials/core

Guitar serial-number decoder. Pure TypeScript, zero runtime dependencies.

Powers the decoder at [guitarserials.org](https://guitarserials.org).

## Install

```sh
npm install @guitarserials/core
# or pnpm add @guitarserials/core
```

## Use

```ts
import { matchSerial } from '@guitarserials/core';

const result = matchSerial('CS500123', 'gibson', { listingYear: 2015 });
// → { year: 2015, tier: 'high', formatName: 'Gibson Custom Shop ...', ... }
```

## Brands (v1)

Gibson, Gibson Custom Shop, Fender, PRS, Heritage, Sire, Ibanez.

## License

MIT.
