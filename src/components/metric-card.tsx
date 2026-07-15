import { IconArrowUpRight, IconArrowDownRight, IconMinus } from "@tabler/icons-react";
import { AnimatedNumber } from "@/components/animated-number";
import { cn } from "@/lib/utils";

export interface MetricCardProps {
  label: string;
  /** Numeric value used for animated count-up. Pass value + format for animation. */
  value?: number;
  format?: (n: number) => string;
  /** Fallback when value/format not supplied. */
  displayValue?: string;
  delta?: {
    value: number;
    label?: string;
    invertColor?: boolean;
  };
  icon?: React.ReactNode;
  loading?: boolean;
  /** Optional emphasis tone applied to the metric number itself. */
  tone?: "default" | "success" | "danger";
  /** Optional progress fill 0-100 shown as a hairline bar below the metric. */
  progress?: number;
}

export function MetricCard({
  label,
  value,
  format,
  displayValue,
  delta,
  icon,
  loading,
  tone = "default",
  progress,
}: MetricCardProps) {
  const deltaTone = (() => {
    if (!delta) return "neutral" as const;
    if (delta.value === 0) return "neutral" as const;
    const good = delta.invertColor ? delta.value < 0 : delta.value > 0;
    return good ? "success" : "danger";
  })();

  return (
    <div className="group relative flex flex-col gap-3 rounded-xl border border-border-subtle bg-bg-surface p-5 transition-all hover:bg-bg-surface-hover hover:border-border-default">
      <div className="flex items-center justify-between">
        <span className="text-micro text-text-muted">{label}</span>
        {icon && <span className="text-text-muted">{icon}</span>}
      </div>

      {loading ? (
        <div className="h-7 w-28 animate-pulse rounded bg-bg-surface-raised" />
      ) : (
        <div
          className={cn(
            "text-2xl font-medium tabular-nums font-mono tracking-tight",
            tone === "success" && "text-success-strong",
            tone === "danger" && "text-danger-strong",
            tone === "default" && "text-text-primary",
          )}
        >
          {value !== undefined && format ? (
            <AnimatedNumber value={value} format={format} />
          ) : (
            displayValue ?? "—"
          )}
        </div>
      )}

      {typeof progress === "number" && !loading && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-bg-surface-raised">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              tone === "danger" ? "bg-danger" : tone === "success" ? "bg-success" : "bg-accent-primary",
            )}
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>
      )}

      {delta && !loading && (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-label",
              deltaTone === "success" && "bg-success-wash text-success-strong",
              deltaTone === "danger" && "bg-danger-wash text-danger-strong",
              deltaTone === "neutral" && "bg-bg-surface-raised text-text-secondary",
            )}
          >
            {delta.value > 0 ? (
              <IconArrowUpRight size={12} strokeWidth={2} />
            ) : delta.value < 0 ? (
              <IconArrowDownRight size={12} strokeWidth={2} />
            ) : (
              <IconMinus size={12} strokeWidth={2} />
            )}
            <span className="tabular-nums">
              {delta.value > 0 ? "+" : ""}
              {delta.value.toFixed(1)}%
            </span>
          </span>
          {delta.label && <span className="text-label text-text-muted">{delta.label}</span>}
        </div>
      )}
    </div>
  );
}
