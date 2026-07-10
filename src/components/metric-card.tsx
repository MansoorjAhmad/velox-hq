import { IconArrowUpRight, IconArrowDownRight, IconMinus } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export interface MetricCardProps {
  label: string;
  value: string;
  delta?: {
    value: number; // percent, sign-included
    label?: string; // e.g. "vs prev 30d"
    /** For inversions like debt where a decrease is good. */
    invertColor?: boolean;
  };
  icon?: React.ReactNode;
  loading?: boolean;
}

export function MetricCard({ label, value, delta, icon, loading }: MetricCardProps) {
  const deltaTone = (() => {
    if (!delta) return "neutral";
    const positive = delta.value > 0;
    const negative = delta.value < 0;
    if (!positive && !negative) return "neutral";
    const good = delta.invertColor ? negative : positive;
    return good ? "success" : "danger";
  })();

  return (
    <div className="group relative flex flex-col gap-4 rounded-lg border border-border-subtle bg-bg-surface p-5 transition-colors hover:bg-bg-surface-hover">
      <div className="flex items-center justify-between">
        <span className="text-micro text-text-muted">{label}</span>
        {icon && <span className="text-text-muted">{icon}</span>}
      </div>

      {loading ? (
        <div className="h-8 w-32 animate-pulse rounded bg-bg-surface-raised" />
      ) : (
        <div className="text-metric-lg text-text-primary">{value}</div>
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
