import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/component-showcase")({
  component: ShowcasePage,
});

function ShowcasePage() {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-h1 text-text-primary">Component Showcase</h1>

      {/* Buttons */}
      <section>
        <h2 className="text-h2 text-text-primary mb-4">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <button className="rounded-radius-md bg-accent-primary px-4 py-2 text-sm font-medium text-text-primary hover:bg-accent-primary-hover transition-colors">
            Primary
          </button>
          <button className="rounded-radius-md bg-bg-surface-raised px-4 py-2 text-sm font-medium text-text-primary hover:bg-bg-surface-hover transition-colors border border-border-default">
            Secondary
          </button>
          <button className="rounded-radius-md bg-danger px-4 py-2 text-sm font-medium text-text-primary hover:bg-danger-strong transition-colors">
            Danger
          </button>
          <button className="rounded-radius-md bg-success px-4 py-2 text-sm font-medium text-text-primary hover:bg-success-strong transition-colors">
            Success
          </button>
          <button className="rounded-radius-md bg-warning px-4 py-2 text-sm font-medium text-text-primary transition-colors">
            Warning
          </button>
        </div>
      </section>

      {/* Badges */}
      <section>
        <h2 className="text-h2 text-text-primary mb-4">Status Badges</h2>
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center rounded-radius-full px-2.5 py-1 text-micro bg-success-wash text-success">Active</span>
          <span className="inline-flex items-center rounded-radius-full px-2.5 py-1 text-micro bg-danger-wash text-danger">Loss</span>
          <span className="inline-flex items-center rounded-radius-full px-2.5 py-1 text-micro bg-warning-wash text-warning">Pending</span>
          <span className="inline-flex items-center rounded-radius-full px-2.5 py-1 text-micro bg-info-wash text-info">Info</span>
          <span className="inline-flex items-center rounded-radius-full px-2.5 py-1 text-micro bg-bg-surface-raised text-text-secondary">Neutral</span>
        </div>
      </section>

      {/* Inputs */}
      <section>
        <h2 className="text-h2 text-text-primary mb-4">Inputs</h2>
        <div className="grid max-w-md gap-4">
          <input
            type="text"
            placeholder="Default input"
            className="w-full rounded-radius-md border border-border-default bg-bg-page px-3 py-2.5 text-body text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
          />
          <input
            type="text"
            placeholder="Disabled input"
            disabled
            className="w-full rounded-radius-md border border-border-subtle bg-bg-surface px-3 py-2.5 text-body text-text-disabled placeholder:text-text-disabled cursor-not-allowed"
          />
        </div>
      </section>

      {/* Metric Cards */}
      <section>
        <h2 className="text-h2 text-text-primary mb-4">Metric Cards</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-radius-lg border border-border-default bg-bg-surface p-5">
            <p className="text-label text-text-secondary mb-2">Total Balance</p>
            <p className="text-metric-lg text-text-primary">$24,580</p>
            <div className="mt-2 inline-flex items-center gap-1 rounded-radius-full bg-success-wash px-2 py-0.5 text-micro text-success">
              +2.4%
            </div>
          </div>
          <div className="rounded-radius-lg border border-border-default bg-bg-surface p-5">
            <p className="text-label text-text-secondary mb-2">Debt Remaining</p>
            <p className="text-metric-lg text-danger">42%</p>
            <div className="mt-2 inline-flex items-center gap-1 rounded-radius-full bg-success-wash px-2 py-0.5 text-micro text-success">
              -3.1 pp
            </div>
          </div>
          <div className="rounded-radius-lg border border-border-default bg-bg-surface p-5">
            <p className="text-label text-text-secondary mb-2">This Month Income</p>
            <p className="text-metric-lg text-text-primary">$8,420</p>
            <div className="mt-2 inline-flex items-center gap-1 rounded-radius-full bg-danger-wash px-2 py-0.5 text-micro text-danger">
              -12%
            </div>
          </div>
          <div className="rounded-radius-lg border border-border-default bg-bg-surface p-5">
            <p className="text-label text-text-secondary mb-2">Goal Progress</p>
            <p className="text-metric-lg text-accent-primary-light">78%</p>
            <div className="mt-2 inline-flex items-center gap-1 rounded-radius-full bg-success-wash px-2 py-0.5 text-micro text-success">
              +5%
            </div>
          </div>
        </div>
      </section>

      {/* Progress Bars */}
      <section>
        <h2 className="text-h2 text-text-primary mb-4">Progress Bars</h2>
        <div className="max-w-lg space-y-4">
          <div>
            <div className="flex justify-between text-small text-text-secondary mb-1.5">
              <span>Debt payoff</span>
              <span className="text-metric-sm text-text-primary">58%</span>
            </div>
            <div className="h-2 w-full rounded-radius-full bg-bg-surface-raised overflow-hidden">
              <div className="h-full rounded-radius-full bg-success" style={{ width: "58%" }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-small text-text-secondary mb-1.5">
              <span>Daily drawdown</span>
              <span className="text-metric-sm text-danger">78%</span>
            </div>
            <div className="h-2 w-full rounded-radius-full bg-bg-surface-raised overflow-hidden">
              <div className="h-full rounded-radius-full bg-danger" style={{ width: "78%" }} />
            </div>
          </div>
        </div>
      </section>

      {/* Empty State */}
      <section>
        <h2 className="text-h2 text-text-primary mb-4">Empty State</h2>
        <div className="flex flex-col items-center justify-center rounded-radius-lg border border-border-default bg-bg-surface py-12 px-6 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-radius-full bg-bg-surface-raised text-text-muted">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h3 className="text-h3 text-text-primary mb-1">No trades logged yet</h3>
          <p className="text-small text-text-secondary max-w-sm">
            Once you log your first trade, it&apos;ll show up here with full performance breakdowns.
          </p>
          <button className="mt-4 rounded-radius-md bg-accent-primary px-4 py-2 text-sm font-medium text-text-primary hover:bg-accent-primary-hover transition-colors">
            Log your first trade
          </button>
        </div>
      </section>

      {/* Typography */}
      <section>
        <h2 className="text-h2 text-text-primary mb-4">Typography</h2>
        <div className="space-y-3">
          <p className="text-h1 text-text-primary">Heading 1 — 28px/500</p>
          <p className="text-h2 text-text-primary">Heading 2 — 20px/500</p>
          <p className="text-h3 text-text-primary">Heading 3 — 16px/500</p>
          <p className="text-body text-text-primary">Body — 14px/400. The quick brown fox jumps over the lazy dog.</p>
          <p className="text-small text-text-secondary">Small — 13px/400. Secondary text and helper copy.</p>
          <p className="text-label text-text-muted">Label — 12px/400. Form labels and metric card labels.</p>
          <p className="text-micro text-text-muted">Micro — 11px/500 uppercase eyebrow</p>
          <p className="text-metric-lg text-text-primary">Metric LG — 32px Geist Mono 1234.56</p>
          <p className="text-metric-md text-text-primary">Metric MD — 22px Geist Mono 1234.56</p>
          <p className="text-metric-sm text-text-primary">Metric SM — 15px Geist Mono 1234.56</p>
        </div>
      </section>
    </div>
  );
}
