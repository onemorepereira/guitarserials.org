import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Human-readable name of the component this boundary wraps (used in the fallback copy). */
  feature?: string;
}

interface State {
  error: Error | null;
}

/**
 * Minimal error boundary for React islands. When a descendant throws during
 * render, we catch it and show a small parchment-toned fallback card rather
 * than letting the island blank out and leaving the user staring at nothing.
 *
 * No runtime error-reporting integration — by design, nothing leaves the
 * browser. The fallback simply points users at GitHub issues.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Surface to the devtools console so a developer can still debug in their
    // own browser. Not shipped to any backend.
    if (typeof console !== 'undefined') {
      console.error(`[${this.props.feature ?? 'react-island'}]`, error, info);
    }
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <section
          role="alert"
          className="rounded-md border border-wine-faint bg-wine-faint/50 px-5 py-4 text-sm text-wine dark:border-wine-faint-dark dark:bg-wine-faint-dark/70 dark:text-wine-dark-text"
        >
          <p className="font-medium">Something went wrong rendering the decoder.</p>
          <p className="mt-2">
            Try reloading the page. If it keeps happening, please{' '}
            <a
              href="https://github.com/onemorepereira/guitarserials.org/issues/new"
              className="underline underline-offset-2"
            >
              open an issue
            </a>{' '}
            with the serial you typed and which browser you're using.
          </p>
          <p className="mt-2 font-mono text-xs opacity-70">{this.state.error.message}</p>
        </section>
      );
    }
    return this.props.children;
  }
}
