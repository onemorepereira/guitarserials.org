import { matchSerial, type SerialMatch } from '@guitarserials/core';
import { useEffect, useMemo, useState } from 'react';
import { BRANDS } from '../lib/brands';
import { describeFormat } from '../lib/formatDescriptions';

type DecodeResult =
  | { kind: 'empty' }
  | { kind: 'none'; brandLabel: string }
  | { kind: 'match'; brandLabel: string; match: SerialMatch }
  | { kind: 'multi'; matches: Array<{ brandLabel: string; match: SerialMatch }> };

const TIER_STYLES: Record<string, string> = {
  verified: 'bg-sage-faint text-sage dark:bg-sage-faint-dark dark:text-sage-dark-text',
  high: 'bg-sage-faint text-sage dark:bg-sage-faint-dark dark:text-sage-dark-text',
  hybrid: 'bg-sage-faint text-sage dark:bg-sage-faint-dark dark:text-sage-dark-text',
  medium: 'bg-ochre-faint text-ochre dark:bg-ochre-faint-dark dark:text-ochre-dark-text',
  low: 'bg-ochre-faint text-ochre dark:bg-ochre-faint-dark dark:text-ochre-dark-text',
  review: 'bg-rust-faint text-rust dark:bg-amber-faint dark:text-amber',
  rejected: 'bg-wine-faint text-wine dark:bg-wine-faint-dark dark:text-wine-dark-text',
};

function tierBadge(tier: string): string {
  return (
    TIER_STYLES[tier] ??
    'bg-paper-sunken text-ink-soft dark:bg-espresso-sunken dark:text-cream-soft'
  );
}

function brandLabelFor(brandId: string): string {
  return BRANDS.find((b) => b.id === brandId)?.label ?? brandId;
}

interface FormState {
  serial: string;
  brand: string;
  listingYear: string;
  modelHint: string;
}

const EMPTY_FORM: FormState = { serial: '', brand: '', listingYear: '', modelHint: '' };

export interface DecoderProps {
  /**
   * Optional brand to preselect when the URL has no `?b=` override. Used by
   * the per-brand pages so the decoder is scoped to that brand by default
   * but users can still switch to "Unsure — try all".
   */
  initialBrand?: string;
}

/** Seed examples shown as clickable chips when the form is empty. */
const EXAMPLE_CHIPS: Array<{ serial: string; brand: string; year?: string; label: string }> = [
  { serial: '82765501', brand: 'gibson', label: 'Gibson 8-digit' },
  { serial: 'CS500123', brand: 'gibson custom shop', year: '2015', label: 'CS Gibson' },
  { serial: 'US24002164', brand: 'fender', label: 'Fender US' },
  { serial: 'AA12345', brand: 'heritage', label: 'Heritage AA' },
  { serial: '08123456', brand: 'prs', label: 'PRS Core' },
];

function readFormFromUrl(): FormState {
  const p = new URLSearchParams(window.location.search);
  return {
    serial: p.get('s') ?? '',
    brand: p.get('b') ?? '',
    listingYear: p.get('y') ?? '',
    modelHint: p.get('m') ?? '',
  };
}

function compute(form: FormState): DecodeResult {
  if (!form.serial.trim()) return { kind: 'empty' };

  const year = form.listingYear ? Number(form.listingYear) : undefined;
  const opts = {
    ...(year && Number.isFinite(year) ? { listingYear: year } : {}),
    ...(form.modelHint.trim() ? { modelHint: form.modelHint.trim() } : {}),
  };

  if (form.brand === '') {
    const matches: Array<{ brandLabel: string; brandId: string; match: SerialMatch }> = [];
    for (const b of BRANDS) {
      const r = matchSerial(form.serial, b.id, opts);
      if (r) matches.push({ brandLabel: b.label, brandId: b.id, match: r });
    }
    // Dedup: when one brand id is a strict prefix of another (e.g. "gibson"
    // vs "gibson custom shop") and they produce the same match, keep only
    // the more specific one.
    const deduped = matches.filter((m) => {
      for (const other of matches) {
        if (other === m) continue;
        if (other.match.brandFormat !== m.match.brandFormat) continue;
        if (other.match.decodedYear !== m.match.decodedYear) continue;
        if (other.match.serial !== m.match.serial) continue;
        if (other.brandId.startsWith(`${m.brandId} `)) return false;
      }
      return true;
    });
    if (deduped.length === 0) return { kind: 'none', brandLabel: 'any brand' };
    if (deduped.length === 1 && deduped[0]) {
      return { kind: 'match', brandLabel: deduped[0].brandLabel, match: deduped[0].match };
    }
    return { kind: 'multi', matches: deduped };
  }

  const result = matchSerial(form.serial, form.brand, opts);
  const brandLabel = brandLabelFor(form.brand);
  return result === null
    ? { kind: 'none', brandLabel }
    : { kind: 'match', brandLabel, match: result };
}

function buildPermalinkQuery(form: FormState): string {
  const p = new URLSearchParams();
  if (form.serial) p.set('s', form.serial);
  if (form.brand) p.set('b', form.brand);
  if (form.listingYear) p.set('y', form.listingYear);
  if (form.modelHint) p.set('m', form.modelHint);
  return p.toString();
}

const inputClass =
  'rounded-md border border-paper-line bg-paper-raised px-3 py-2 font-mono text-base text-ink outline-none transition focus:border-rust focus:ring-2 focus:ring-rust/20 dark:border-espresso-line dark:bg-espresso-sunken dark:text-cream dark:focus:border-amber dark:focus:ring-amber/25';

const selectClass =
  'rounded-md border border-paper-line bg-paper-raised px-3 py-2 text-base text-ink outline-none transition focus:border-rust focus:ring-2 focus:ring-rust/20 dark:border-espresso-line dark:bg-espresso-sunken dark:text-cream dark:focus:border-amber dark:focus:ring-amber/25';

const labelClass =
  'text-[11px] font-medium uppercase tracking-[0.08em] text-ink-faint dark:text-cream-faint';

export default function Decoder({ initialBrand }: DecoderProps = {}) {
  const seed: FormState = initialBrand ? { ...EMPTY_FORM, brand: initialBrand } : EMPTY_FORM;
  const [form, setForm] = useState<FormState>(seed);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const initial = readFormFromUrl();
    const merged: FormState = {
      ...initial,
      brand: initial.brand || initialBrand || '',
    };
    if (initial.serial) {
      setForm(merged);
      setSubmitted(true);
    } else if (initialBrand) {
      setForm((prev) => ({ ...prev, brand: prev.brand || initialBrand }));
    }
    setHydrated(true);
  }, [initialBrand]);

  const result = useMemo<DecodeResult>(
    () => (submitted ? compute(form) : { kind: 'empty' }),
    [form, submitted],
  );

  useEffect(() => {
    if (!submitted) return;
    const qs = buildPermalinkQuery(form);
    const next = `${window.location.pathname}${qs ? `?${qs}` : ''}`;
    window.history.replaceState(null, '', next);
  }, [form, submitted]);

  const onSubmit = (e?: { preventDefault?: () => void }) => {
    e?.preventDefault?.();
    setSubmitted(true);
  };

  const onChipClick = (chip: (typeof EXAMPLE_CHIPS)[number]) => {
    setForm({
      serial: chip.serial,
      brand: chip.brand,
      listingYear: chip.year ?? '',
      modelHint: '',
    });
    setSubmitted(true);
  };

  const onCopyPermalink = async () => {
    const url = `${window.location.origin}${window.location.pathname}?${buildPermalinkQuery(form)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked — fall back silently
    }
  };

  // Hide the multi-brand example chips when the decoder is scoped to a
  // specific brand — the brand page's format list already surfaces
  // per-format "Try it" examples.
  const showChips = !initialBrand && (!submitted || result.kind === 'empty');

  return (
    <div className="flex flex-col gap-5">
      <form
        onSubmit={onSubmit}
        data-hydrated={hydrated ? 'true' : 'false'}
        className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px_140px]"
      >
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Serial number</span>
          <input
            required
            type="text"
            name="s"
            value={form.serial}
            onChange={(e) => setForm({ ...form, serial: e.target.value })}
            placeholder="e.g. CS500123 or 82765501"
            className={inputClass}
            data-testid="serial-input"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Brand</span>
          <select
            name="b"
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
            className={selectClass}
            data-testid="brand-select"
          >
            <option value="">Unsure — try all</option>
            {BRANDS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Year (optional)</span>
          <input
            type="number"
            inputMode="numeric"
            name="y"
            min={1940}
            max={2035}
            placeholder="e.g. 2015"
            value={form.listingYear}
            onChange={(e) => setForm({ ...form, listingYear: e.target.value })}
            className={inputClass}
            data-testid="year-input"
          />
        </label>

        <label className="flex flex-col gap-1.5 md:col-span-3">
          <span className={labelClass}>
            Model hint (optional — helps disambiguate CS / Historic / AVRI / Classic)
          </span>
          <input
            type="text"
            name="m"
            value={form.modelHint}
            onChange={(e) => setForm({ ...form, modelHint: e.target.value })}
            placeholder="e.g. Les Paul Classic, American Vintage '52 Telecaster, Les Paul Reissue R9"
            className={inputClass}
            data-testid="hint-input"
          />
        </label>

        <div className="flex items-center gap-4 md:col-span-3">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md bg-rust px-5 py-2 text-sm font-semibold tracking-wide text-paper-raised shadow-sm transition hover:bg-rust-strong dark:bg-amber dark:text-espresso dark:hover:bg-amber-strong"
            data-testid="decode-submit"
          >
            Decode
          </button>
          {showChips && (
            <div className="hidden flex-wrap items-center gap-2 text-xs md:flex">
              <span className="text-ink-faint dark:text-cream-faint">Try:</span>
              {EXAMPLE_CHIPS.map((chip) => (
                <button
                  key={chip.serial}
                  type="button"
                  onClick={() => onChipClick(chip)}
                  className="rounded-full border border-paper-line bg-paper-raised px-2.5 py-0.5 font-mono text-[11px] text-ink-soft transition hover:border-rust hover:text-rust dark:border-espresso-line dark:bg-espresso-sunken dark:text-cream-soft dark:hover:border-amber dark:hover:text-amber"
                  title={chip.label}
                >
                  {chip.serial}
                </button>
              ))}
            </div>
          )}
        </div>
      </form>

      <ResultPanel result={result} onCopyPermalink={onCopyPermalink} copied={copied} />
    </div>
  );
}

interface ResultPanelProps {
  result: DecodeResult;
  onCopyPermalink: () => void;
  copied: boolean;
}

function ResultPanel({ result, onCopyPermalink, copied }: ResultPanelProps) {
  if (result.kind === 'empty') return null;

  if (result.kind === 'none') {
    return (
      <section
        data-testid="result-none"
        className="rounded-md border border-paper-line bg-paper-sunken px-5 py-4 text-sm text-ink-soft dark:border-espresso-line dark:bg-espresso-sunken dark:text-cream-soft"
      >
        <p className="font-medium text-ink dark:text-cream">No match under {result.brandLabel}.</p>
        <p className="mt-1">
          Check for typos, try a different brand, or see the brand format guide. If you know this is
          correct and we got it wrong, please{' '}
          <a
            href="https://github.com/guitarserials/guitarserials/issues/new?template=incorrect_decode.md"
            className="text-rust underline underline-offset-2 dark:text-amber"
          >
            open an incorrect-decode report
          </a>
          .
        </p>
      </section>
    );
  }

  if (result.kind === 'multi') {
    return (
      <section className="flex flex-col gap-3" data-testid="result-multi">
        <p className="text-sm text-ink-soft dark:text-cream-soft">
          This serial matches{' '}
          <strong className="text-ink dark:text-cream">{result.matches.length}</strong> supported
          brands. Pick the one that matches your guitar:
        </p>
        <div className="flex flex-col gap-3">
          {result.matches.map((m) => (
            <MatchCard key={m.brandLabel} brandLabel={m.brandLabel} match={m.match} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3" data-testid="result-match">
      <MatchCard brandLabel={result.brandLabel} match={result.match} />
      <button
        type="button"
        onClick={onCopyPermalink}
        className="inline-flex w-max items-center gap-2 rounded-md border border-paper-line bg-paper-raised px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-rust hover:text-rust dark:border-espresso-line dark:bg-espresso-sunken dark:text-cream-soft dark:hover:border-amber dark:hover:text-amber"
      >
        {copied ? '✓ Copied' : 'Copy permalink'}
      </button>
    </section>
  );
}

function MatchCard({ brandLabel, match }: { brandLabel: string; match: SerialMatch }) {
  return (
    <div className="rounded-md border border-paper-line bg-paper-raised px-5 py-4 shadow-sm dark:border-espresso-line dark:bg-espresso-raised">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-mono text-lg font-semibold tracking-tight text-ink dark:text-cream">
          {match.serial}
        </span>
        <span className="text-ink-faint dark:text-cream-faint">—</span>
        <span className="display text-base italic text-ink-soft dark:text-cream-soft">
          {brandLabel}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide ${tierBadge(match.confidenceTier)}`}
          data-testid="result-tier"
        >
          {match.confidenceTier}
        </span>
        <span className="text-sm">
          {match.decodedYear !== null ? (
            <>
              <span className="text-ink-faint dark:text-cream-faint">Year</span>{' '}
              <strong
                data-testid="result-year"
                className="display text-lg font-semibold text-ink dark:text-cream"
              >
                {match.decodedYear}
              </strong>
            </>
          ) : (
            <span className="text-ink-soft dark:text-cream-soft">
              Year not encoded in this format
            </span>
          )}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink-soft dark:text-cream-soft">
        {describeFormat(match.brandFormat)}
      </p>

      <details className="mt-3 text-xs">
        <summary className="cursor-pointer select-none text-ink-faint hover:text-rust dark:text-cream-faint dark:hover:text-amber">
          Format details
        </summary>
        <dl className="mt-2 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 pl-4 text-ink-soft dark:text-cream-soft">
          <dt className="text-ink-faint dark:text-cream-faint">Format ID</dt>
          <dd className="font-mono">{match.brandFormat}</dd>
          {match.candidates.length > 1 && (
            <>
              <dt className="text-ink-faint dark:text-cream-faint">Candidates</dt>
              <dd>
                <ul className="space-y-0.5">
                  {match.candidates.map((c) => (
                    <li key={`${c.brandFormat}:${c.decodedYear ?? 'none'}`}>
                      <span className="font-mono">{c.brandFormat}</span>
                      {c.decodedYear !== null ? ` → ${c.decodedYear}` : ' (year unknown)'}
                    </li>
                  ))}
                </ul>
              </dd>
            </>
          )}
        </dl>
      </details>
    </div>
  );
}
