import { IconArrowUpRight, IconArrowDownRight, IconMinus, IconTrendingUp } from "@tabler/icons-react";
import { AnimatedNumber } from "@/components/animated-number";
import { cn } from "@/lib/utils";

interface HeroMetricProps {
  label: string;
  value: number;
  format: (n: number) => string;
  delta?: { value: number; label?: string; invertColor?: boolean };
  loading?: boolean;
}

export function HeroMetric({ label, value, format, delta, loading }: HeroMetricProps) {
  const tone = (() => {
    if (!delta) return "neutral" as const;
    if (delta.value === 0) return "neutral" as const;
    const good = delta.invertColor ? delta.value < 0 : delta.value > 0;
    return good ? "success" : "danger";
  })();

  return (
    <div className="relative group">
      {/* Ambient glow */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-accent-primary/30 via-accent-primary/10 to-transparent opacity-40 blur-sm transition-opacity group-hover:opacity-70 pointer-events-none" />

      <div className="relative overflow-hidden rounded-2xl border border-border-default bg-gradient-to-br from-bg-surface-raised via-bg-surface to-bg-surface p-6 md:p-8">
        {/* decorative sigil */}
        <div className="absolute -right-8 -top-8 opacity-[0.06] text-accent-primary-light pointer-events-none">
          <IconTrendingUp size={220} strokeWidth={1} />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-micro text-text-muted">{label}</span>
          <span className="rounded-full border border-accent-primary-wash-strong bg-accent-primary-wash px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-accent-primary-light">
            Live
          </span>
        </div>

        <div className="mt-3">
          {loading ? (
            <div className="h-12 w-64 animate-pulse rounded bg-bg-surface-raised" />
          ) : (
            <div className="text-4xl md:text-6xl font-medium tracking-tight text-text-primary tabular-nums font-mono">
              <AnimatedNumber value={value} format={format} />
            </div>
          )}
        </div>

        {delta && !loading && (
          <div className="mt-4 flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-label font-medium",
                tone === "success" && "bg-success-wash text-success-strong",
                tone === "danger" && "bg-danger-wash text-danger-strong",
                tone === "neutral" && "bg-bg-surface-raised text-text-secondary",
              )}
            >
              {delta.value > 0 ? (
                <IconArrowUpRight size={14} strokeWidth={2} />
              ) : delta.value < 0 ? (
                <IconArrowDownRight size={14} strokeWidth={2} />
              ) : (
                <IconMinus size={14} strokeWidth={2} />
              )}
              <span className="tabular-nums">
                {delta.value > 0 ? "+" : ""}
                {delta.value.toFixed(1)}%
              </span>
            </span>
            {delta.label && <span className="text-small text-text-muted">{delta.label}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
