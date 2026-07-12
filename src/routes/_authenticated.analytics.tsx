import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell,
} from "recharts";
import { IconTrendingUp, IconTargetArrow, IconChartBar, IconAlertTriangle } from "@tabler/icons-react";
import { MetricCard } from "@/components/metric-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getAnalytics, type BreakdownRow } from "@/lib/analytics.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/analytics")({
  component: AnalyticsPage,
});

const currency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const currency2 = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);

const RANGES = [
  { label: "30d", value: 30 },
  { label: "90d", value: 90 },
  { label: "6m", value: 180 },
  { label: "1y", value: 365 },
];

function AnalyticsPage() {
  const [days, setDays] = useState(90);
  const fetchAnalytics = useServerFn(getAnalytics);

  const q = useQuery({
    queryKey: ["analytics", days],
    queryFn: () => fetchAnalytics({ data: { days } }),
  });

  const t = q.data?.totals;
  const empty = !q.isLoading && (q.data?.totals.trades ?? 0) === 0;

  const equityData = useMemo(
    () => (q.data?.equityCurve ?? []).map((p) => ({ ...p, date: p.date.slice(5) })),
    [q.data],
  );

  return (
    <div className="mx-auto w-full max-w-[1400px] p-4 md:p-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h1 text-text-primary">Analytics</h1>
          <p className="mt-1 text-body text-text-secondary">
            Performance breakdown over the last{" "}
            <span className="font-mono tabular-nums">{days}</span> days
          </p>
        </div>
        <div className="inline-flex rounded-md border border-border-subtle bg-bg-surface p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setDays(r.value)}
              className={cn(
                "rounded px-3 py-1.5 text-small transition-colors",
                days === r.value
                  ? "bg-bg-surface-raised text-text-primary"
                  : "text-text-secondary hover:text-text-primary",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </header>

      {q.isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : empty ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-border-subtle bg-bg-surface p-16 text-center">
          <IconChartBar size={40} className="text-text-muted" strokeWidth={1.25} />
          <div>
            <div className="text-h3 text-text-primary">No trades in this window</div>
            <p className="mt-1 text-body text-text-secondary">
              Log trades in the journal to unlock performance analytics.
            </p>
          </div>
          <Button asChild variant="outline">
            <a href="/journal">Go to Journal</a>
          </Button>
        </div>
      ) : t ? (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <MetricCard
              label="Net P&L"
              value={currency2(t.netPnl)}
              icon={<IconTrendingUp size={16} strokeWidth={1.5} />}
            />
            <MetricCard
              label="Win Rate"
              value={`${t.winRate.toFixed(1)}%`}
              icon={<IconTargetArrow size={16} strokeWidth={1.5} />}
            />
            <MetricCard
              label="Profit Factor"
              value={t.profitFactor === 0 ? "—" : t.profitFactor.toFixed(2)}
            />
            <MetricCard
              label="Expectancy / trade"
              value={currency2(t.expectancy)}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCell label="Trades" value={String(t.trades)} />
            <StatCell label="Avg Win" value={currency2(t.avgWin)} tone="success" />
            <StatCell label="Avg Loss" value={currency2(-t.avgLoss)} tone="danger" />
            <StatCell label="Avg R" value={`${t.avgR.toFixed(2)}R`} />
            <StatCell label="Best Trade" value={currency2(t.bestTrade)} tone="success" />
            <StatCell label="Worst Trade" value={currency2(t.worstTrade)} tone="danger" />
            <StatCell label="Max Drawdown" value={currency2(-t.maxDrawdown)} tone="danger" />
            <StatCell
              label="Rule Violations"
              value={String(t.ruleViolations)}
              tone={t.ruleViolations > 0 ? "danger" : undefined}
              icon={t.ruleViolations > 0 ? <IconAlertTriangle size={12} strokeWidth={2} /> : null}
            />
          </div>

          {/* Equity Curve */}
          <section className="mt-8 rounded-lg border border-border-subtle bg-bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-h3 text-text-primary">Equity curve</h2>
                <p className="text-small text-text-secondary">
                  Cumulative P&L, {equityData.length} trading day{equityData.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="text-right">
                <div className="text-micro text-text-muted">Streaks</div>
                <div className="font-mono tabular-nums text-small text-text-primary">
                  <span className="text-success-strong">W{t.longestWinStreak}</span>
                  {" · "}
                  <span className="text-danger-strong">L{t.longestLossStreak}</span>
                </div>
              </div>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer>
                <AreaChart data={equityData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-accent-primary)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--color-accent-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--color-border-subtle)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => currency(Number(v))} width={60} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-bg-surface-raised)",
                      border: "1px solid var(--color-border-subtle)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "var(--color-text-secondary)" }}
                    formatter={(v: number) => currency2(Number(v))}
                  />
                  <Area type="monotone" dataKey="equity" stroke="var(--color-accent-primary)" strokeWidth={2} fill="url(#eq)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Breakdowns */}
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <BreakdownChart title="By session" rows={q.data!.bySession} />
            <BreakdownChart title="By setup" rows={q.data!.bySetup} />
            <BreakdownChart title="By pair" rows={q.data!.byPair.slice(0, 8)} />
            <BreakdownChart title="By day of week" rows={q.data!.byDayOfWeek} />
          </div>
        </>
      ) : null}
    </div>
  );
}

function StatCell({
  label, value, tone, icon,
}: { label: string; value: string; tone?: "success" | "danger"; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border-subtle bg-bg-surface px-4 py-3">
      <div className="text-micro text-text-muted">{label}</div>
      <div
        className={cn(
          "mt-1 flex items-center gap-1 font-mono tabular-nums text-body",
          tone === "success" && "text-success-strong",
          tone === "danger" && "text-danger-strong",
          !tone && "text-text-primary",
        )}
      >
        {icon}
        {value}
      </div>
    </div>
  );
}

function BreakdownChart({ title, rows }: { title: string; rows: BreakdownRow[] }) {
  const data = rows.filter((r) => r.trades > 0);
  return (
    <section className="rounded-lg border border-border-subtle bg-bg-surface p-5">
      <h3 className="mb-4 text-h3 text-text-primary">{title}</h3>
      {data.length === 0 ? (
        <div className="py-8 text-center text-small text-text-muted">No data</div>
      ) : (
        <>
          <div className="h-[180px] w-full">
            <ResponsiveContainer>
              <BarChart data={data} layout="vertical" margin={{ left: 0, right: 8 }}>
                <CartesianGrid stroke="var(--color-border-subtle)" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => currency(Number(v))} />
                <YAxis type="category" dataKey="key" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} width={80} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-bg-surface-raised)",
                    border: "1px solid var(--color-border-subtle)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => currency2(Number(v))}
                  cursor={{ fill: "var(--color-bg-surface-hover)" }}
                />
                <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
                  {data.map((r, i) => (
                    <Cell key={i} fill={r.pnl >= 0 ? "var(--color-success-strong)" : "var(--color-danger-strong)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-1.5">
            {data.slice(0, 5).map((r) => (
              <div key={r.key} className="flex items-center justify-between text-small">
                <span className="capitalize text-text-secondary">{r.key}</span>
                <span className="font-mono tabular-nums text-text-muted">
                  {r.trades} trades · {r.winRate.toFixed(0)}% WR
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
