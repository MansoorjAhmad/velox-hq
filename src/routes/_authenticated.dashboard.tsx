import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  IconCreditCard,
  IconCoin,
  IconChartLine,
  IconSparkles,
} from "@tabler/icons-react";
import { MetricCard } from "@/components/metric-card";
import { HeroMetric } from "@/components/hero-metric";
import { getDashboardMetrics, type DashboardMetrics } from "@/lib/dashboard.functions";
import { useDemoMode, demoMetrics } from "@/lib/demo-data";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

const currency = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Math.round(n));

function DashboardPage() {
  const [demo, setDemo] = useDemoMode();
  const fetchMetrics = useServerFn(getDashboardMetrics);
  const query = useQuery({
    queryKey: ["dashboard", "metrics"],
    queryFn: () => fetchMetrics(),
    enabled: !demo,
  });

  const metrics: DashboardMetrics | undefined = demo ? demoMetrics : query.data;
  const loading = !demo && query.isLoading;

  const netWorth = metrics?.netWorth ?? 0;
  const totalDebt = metrics?.totalDebt ?? 0;
  const monthlyIncome = metrics?.monthlyIncome ?? 0;
  const tradingPnl = metrics?.tradingPnl ?? 0;

  // Progress heuristics (bounded 0-100)
  const debtProgress = Math.min(100, (totalDebt / Math.max(1, monthlyIncome * 12)) * 100);
  const incomeProgress = 82; // static visual until goal targets land
  const pnlProgress = Math.min(100, Math.max(0, (tradingPnl / Math.max(1, monthlyIncome)) * 100 + 50));

  return (
    <div className="mx-auto w-full max-w-[1400px] p-4 md:p-8 pb-24 md:pb-8">
      <header className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-micro text-text-muted">Overview</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-accent-primary-wash px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-accent-primary-light">
              <span className="h-1 w-1 rounded-full bg-accent-primary-light animate-pulse" />
              Live
            </span>
          </div>
          <h1 className="text-h1 text-text-primary truncate">Dashboard</h1>
          <p className="mt-1 text-body text-text-secondary">Last 30 days snapshot</p>
        </div>

        <label className="flex shrink-0 cursor-pointer items-center gap-3 rounded-full border border-border-subtle bg-bg-surface px-3 py-2">
          <IconSparkles size={14} className="text-accent-primary-light" strokeWidth={1.5} />
          <span className="hidden sm:inline text-label text-text-secondary">Demo data</span>
          <Switch checked={demo} onCheckedChange={setDemo} />
        </label>
      </header>

      {demo && (
        <div className="mb-6 flex items-center gap-2 rounded-md border border-accent-primary-wash-strong bg-accent-primary-wash px-4 py-2.5 text-small text-text-secondary">
          <IconSparkles size={14} className="text-accent-primary-light" strokeWidth={1.5} />
          Showing demo numbers — toggle off to view your real data.
        </div>
      )}

      {query.isError && !demo && (
        <div className="mb-6 rounded-md border border-danger-wash bg-danger-wash px-4 py-2.5 text-small text-danger-strong">
          Couldn't load metrics. Refresh to retry.
        </div>
      )}

      {/* Hero net worth */}
      <HeroMetric
        label="Net Worth"
        value={netWorth}
        format={currency}
        loading={loading}
        delta={
          metrics
            ? { value: metrics.deltas.netWorth, label: "vs prev 30d" }
            : undefined
        }
      />

      {/* KPI strip */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Trading P&L"
          value={tradingPnl}
          format={currency}
          loading={loading}
          tone={tradingPnl >= 0 ? "success" : "danger"}
          progress={pnlProgress}
          icon={<IconChartLine size={16} strokeWidth={1.5} />}
          delta={
            metrics
              ? { value: metrics.deltas.tradingPnl, label: "vs prev 30d" }
              : undefined
          }
        />
        <MetricCard
          label="Monthly Income"
          value={monthlyIncome}
          format={currency}
          loading={loading}
          progress={incomeProgress}
          icon={<IconCoin size={16} strokeWidth={1.5} />}
          delta={
            metrics
              ? { value: metrics.deltas.monthlyIncome, label: "vs prev 30d" }
              : undefined
          }
        />
        <MetricCard
          label="Total Debt"
          value={totalDebt}
          format={currency}
          loading={loading}
          tone={totalDebt > 0 ? "danger" : "default"}
          progress={debtProgress}
          icon={<IconCreditCard size={16} strokeWidth={1.5} />}
          delta={
            metrics
              ? {
                  value: metrics.deltas.totalDebt,
                  label: "vs prev 30d",
                  invertColor: true,
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
