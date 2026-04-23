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
  verified: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  high: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  hybrid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  low: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  review: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
};

function tierBadge(tier: string): string {
  return (
    TIER_STYLES[tier] ?? 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300'
  );
}

function brandLabelFor(brandId: string): string {
  return BRANDS.find((b) => b.id === brandId)?.label ?? brandId;
}

interface FormState {
  serial: string;
  brand: string; // brand id or "" for unsure
  listingYear: string;
  modelHint: string;
}

function parseInitialState(): FormState {
  if (typeof window === 'undefined') {
    return { serial: '', brand: '', listingYear: '', modelHint: '' };
  }
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
    // "Unsure" — try all brands and show every valid match.
    const matches: Array<{ brandLabel: string; match: SerialMatch }> = [];
    for (const b of BRANDS) {
      const r = matchSerial(form.serial, b.id, opts);
      if (r) matches.push({ brandLabel: b.label, match: r });
    }
    if (matches.length === 0) return { kind: 'none', brandLabel: 'any brand' };
    if (matches.length === 1 && matches[0]) {
      return { kind: 'match', brandLabel: matches[0].brandLabel, match: matches[0].match };
    }
    return { kind: 'multi', matches };
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

export default function Decoder() {
  const [form, setForm] = useState<FormState>(() => parseInitialState());
  const [submitted, setSubmitted] = useState<boolean>(
    () => typeof window !== 'undefined' && !!new URLSearchParams(window.location.search).get('s'),
  );
  const [copied, setCopied] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

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

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={onSubmit}
        data-hydrated={hydrated ? 'true' : 'false'}
        className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px_140px]"
      >
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            Serial number
          </span>
          <input
            required
            type="text"
            name="s"
            value={form.serial}
            onChange={(e) => setForm({ ...form, serial: e.target.value })}
            placeholder="e.g. CS500123 or 82765501"
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 font-mono text-base shadow-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-400/30 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-400"
            data-testid="serial-input"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            Brand
          </span>
          <select
            name="b"
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-base shadow-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-400/30 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-400"
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

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            Year (optional)
          </span>
          <input
            type="number"
            inputMode="numeric"
            name="y"
            min={1940}
            max={2035}
            placeholder="e.g. 2015"
            value={form.listingYear}
            onChange={(e) => setForm({ ...form, listingYear: e.target.value })}
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-base shadow-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-400/30 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-400"
            data-testid="year-input"
          />
        </label>

        <label className="flex flex-col gap-1 md:col-span-3">
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            Model hint (optional — helps disambiguate CS / Historic / AVRI / Classic)
          </span>
          <input
            type="text"
            name="m"
            value={form.modelHint}
            onChange={(e) => setForm({ ...form, modelHint: e.target.value })}
            placeholder="e.g. Les Paul Classic, American Vintage '52 Telecaster, Les Paul Reissue R9"
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-base shadow-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-400/30 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-400"
            data-testid="hint-input"
          />
        </label>

        <div className="md:col-span-3">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            data-testid="decode-submit"
          >
            Decode
          </button>
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
        className="rounded-lg border border-neutral-200 bg-neutral-50 px-5 py-4 text-sm text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
      >
        <p className="font-medium">No match under {result.brandLabel}.</p>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400">
          Check for typos, try a different brand, or see the brand format guide. If you know this is
          correct and we got it wrong, please{' '}
          <a
            href="https://github.com/guitarserials/guitarserials/issues/new?template=incorrect_decode.md"
            className="underline"
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
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          This serial matches <strong>{result.matches.length}</strong> supported brands. Pick the
          one that matches your guitar:
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
        className="inline-flex w-max items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
      >
        {copied ? '✓ Copied' : '🔗 Copy permalink'}
      </button>
    </section>
  );
}

function MatchCard({ brandLabel, match }: { brandLabel: string; match: SerialMatch }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-5 py-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-lg font-semibold">{match.serial}</span>
        <span className="text-sm text-neutral-600 dark:text-neutral-400">—</span>
        <span className="text-sm font-medium">{brandLabel}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tierBadge(match.confidenceTier)}`}
          data-testid="result-tier"
        >
          {match.confidenceTier}
        </span>
        <span className="text-sm">
          {match.decodedYear !== null ? (
            <>
              <span className="text-neutral-600 dark:text-neutral-400">Year:</span>{' '}
              <strong data-testid="result-year">{match.decodedYear}</strong>
            </>
          ) : (
            <span className="text-neutral-600 dark:text-neutral-400">
              Year not encoded in this format
            </span>
          )}
        </span>
        <span className="font-mono text-xs text-neutral-500 dark:text-neutral-500">
          format: {match.brandFormat}
        </span>
      </div>

      <p className="mt-3 text-sm text-neutral-700 dark:text-neutral-300">
        {describeFormat(match.brandFormat)}
      </p>

      {match.candidates.length > 1 && (
        <details className="mt-3 text-xs text-neutral-600 dark:text-neutral-400">
          <summary className="cursor-pointer select-none">
            {match.candidates.length} possible interpretations considered
          </summary>
          <ul className="mt-2 space-y-1 pl-4">
            {match.candidates.map((c) => (
              <li key={`${c.brandFormat}:${c.decodedYear ?? 'none'}`}>
                <span className="font-mono">{c.brandFormat}</span>
                {c.decodedYear !== null ? ` → ${c.decodedYear}` : ' (year unknown)'}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
