# Contributing to guitarserials.org

Thanks for wanting to help. This project lives or dies on the accuracy of its brand data, so the bar for contributions is "cite your sources and write a test."

## Ways to contribute

- **Fix an incorrect decode** — open an issue using the "Incorrect decode" template and include the serial, the brand, what it returned, and what you believe is correct with sources.
- **Add support for a new brand** — see below.
- **Improve a brand's format coverage** — add new formats to an existing brand, again with sources + tests.
- **Improve the site / docs** — copy fixes, accessibility, dark mode, performance.

## Ground rules

- **Conventional Commits** for commit messages: `type(scope): description`. Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `build`, `ci`.
- **Branch naming**: `type/short-description` (e.g. `feat/martin-serials`, `fix/heritage-regex`).
- **No direct pushes to `main`.** Open a pull request.
- **No AI attribution in commit messages or PR descriptions.**
- **Don't commit secrets.** `.gitignore` already excludes `.env*`, `*.key`, `*.pem`, and kubeconfigs. If you think you need to commit a credential, open an issue instead.

## Adding a new brand

Every new-brand PR must include all three of the following. PRs missing any of these will be asked to complete them before review:

1. **At least two authoritative sources cited per format claim.** Authoritative means the brand itself, a published reference book, a reputable museum/registry, or multiple corroborating expert accounts. Forum posts alone don't cut it. Link the sources in the matcher file as comments and in the MDX guide page as footnotes.
2. **Test cases for every format claim.** For each format/era, add at least one positive test case with a known correct decode, and negative test cases for edge conditions (short serials, wrong prefix, ambiguous year). The same confidence-tier framework from the Python source applies: `review`, `low`, `medium`, `high`, `hybrid`, `verified`.
3. **A guide page in `apps/web/src/content/brands/<brand>.mdx`** describing the formats, example serials, year ranges, and gotchas. Keep it factual and short.

Files you'll touch:

```
packages/core/src/patterns/<brand>.ts       — the matcher
packages/core/tests/<brand>.test.ts          — the tests
apps/web/src/content/brands/<brand>.mdx      — the guide page
apps/web/src/pages/brands/<brand>/find-serial.astro — "where to find your serial" page
```

## Local development

```sh
pnpm install
pnpm -C packages/core test --watch
pnpm -C apps/web dev
```

All PRs must pass `pnpm lint`, `pnpm typecheck`, and `pnpm test` in CI.

## Code of conduct

By participating, you agree to abide by the [Code of Conduct](./CODE_OF_CONDUCT.md).
