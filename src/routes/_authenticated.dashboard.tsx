import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  IconWallet,
  IconCreditCard,
  IconCoin,
  IconChartLine,
  IconSparkles,
} from "@tabler/icons-react";
import { MetricCard } from "@/components/metric-card";
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
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  }).format(n);

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

  return (
    <div className="mx-auto w-full max-w-[1400px] p-4 md:p-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h1 text-text-primary">Dashboard</h1>
          <p className="mt-1 text-body text-text-secondary">Last 30 days snapshot</p>
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-full border border-border-subtle bg-bg-surface px-3 py-2">
          <IconSparkles size={14} className="text-accent-primary-light" strokeWidth={1.5} />
          <span className="text-label text-text-secondary">Demo data</span>
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Net Worth"
          value={metrics ? currency(metrics.netWorth) : "—"}
          loading={loading}
          icon={<IconWallet size={16} strokeWidth={1.5} />}
          delta={
            metrics
              ? { value: metrics.deltas.netWorth, label: "vs prev 30d" }
              : undefined
          }
        />
        <MetricCard
          label="Total Debt"
          value={metrics ? currency(metrics.totalDebt) : "—"}
          loading={loading}
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
        <MetricCard
          label="Monthly Income"
          value={metrics ? currency(metrics.monthlyIncome) : "—"}
          loading={loading}
          icon={<IconCoin size={16} strokeWidth={1.5} />}
          delta={
            metrics
              ? { value: metrics.deltas.monthlyIncome, label: "vs prev 30d" }
              : undefined
          }
        />
        <MetricCard
          label="Trading P&L"
          value={metrics ? currency(metrics.tradingPnl) : "—"}
          loading={loading}
          icon={<IconChartLine size={16} strokeWidth={1.5} />}
          delta={
            metrics
              ? { value: metrics.deltas.tradingPnl, label: "vs prev 30d" }
              : undefined
          }
        />
      </div>
    </div>
  );
}
