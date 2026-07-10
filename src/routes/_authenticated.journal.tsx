import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IconPlus, IconTrash, IconNotebook, IconAlertTriangle } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { listTrades, deleteTrade, type TradeRow } from "@/lib/trades.functions";
import { listTradingAccounts } from "@/lib/trading-accounts.functions";
import { TradeFormDrawer } from "@/components/trade-form-drawer";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/journal")({
  component: JournalPage,
});

const currency = (n: number | null) =>
  n == null
    ? "—"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(n);

function JournalPage() {
  const fetchTrades = useServerFn(listTrades);
  const fetchAccounts = useServerFn(listTradingAccounts);
  const deleteFn = useServerFn(deleteTrade);
  const qc = useQueryClient();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState<string>("all");
  const [directionFilter, setDirectionFilter] = useState<string>("all");

  const tradesQuery = useQuery({
    queryKey: ["trades"],
    queryFn: () => fetchTrades(),
  });

  const accountsQuery = useQuery({
    queryKey: ["trading-accounts"],
    queryFn: () => fetchAccounts(),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Trade deleted");
      qc.invalidateQueries({ queryKey: ["trades"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = useMemo(() => {
    const rows = tradesQuery.data ?? [];
    return rows.filter((t) => {
      if (resultFilter !== "all" && t.result !== resultFilter) return false;
      if (directionFilter !== "all" && t.direction !== directionFilter) return false;
      if (search && !t.pair.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [tradesQuery.data, resultFilter, directionFilter, search]);

  const stats = useMemo(() => {
    const rows = tradesQuery.data ?? [];
    const total = rows.length;
    const wins = rows.filter((r) => r.result === "win").length;
    const losses = rows.filter((r) => r.result === "loss").length;
    const totalPnl = rows.reduce((s, r) => s + Number(r.pnl ?? 0), 0);
    const winRate = wins + losses > 0 ? (wins / (wins + losses)) * 100 : 0;
    return { total, wins, losses, totalPnl, winRate };
  }, [tradesQuery.data]);

  return (
    <div className="mx-auto w-full max-w-[1400px] p-4 md:p-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h1 text-text-primary">Trading Journal</h1>
          <p className="mt-1 text-body text-text-secondary">
            {stats.total} trade{stats.total === 1 ? "" : "s"} logged · Win rate{" "}
            <span className="font-mono tabular-nums">{stats.winRate.toFixed(1)}%</span> · Net{" "}
            <span
              className={cn(
                "font-mono tabular-nums",
                stats.totalPnl > 0 && "text-success-strong",
                stats.totalPnl < 0 && "text-danger-strong",
              )}
            >
              {currency(stats.totalPnl)}
            </span>
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <IconPlus size={16} strokeWidth={2} />
          Log trade
        </Button>
      </header>

      <div className="mb-4 flex flex-wrap gap-2">
        <Input
          placeholder="Search pair…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-[240px]"
        />
        <Select value={resultFilter} onValueChange={setResultFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All results</SelectItem>
            <SelectItem value="win">Wins</SelectItem>
            <SelectItem value="loss">Losses</SelectItem>
            <SelectItem value="breakeven">Breakeven</SelectItem>
          </SelectContent>
        </Select>
        <Select value={directionFilter} onValueChange={setDirectionFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sides</SelectItem>
            <SelectItem value="long">Long</SelectItem>
            <SelectItem value="short">Short</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-lg border border-border-subtle bg-bg-surface">
        <Table>
          <TableHeader>
            <TableRow className="border-border-subtle">
              <TableHead>Date</TableHead>
              <TableHead>Pair</TableHead>
              <TableHead>Side</TableHead>
              <TableHead>Setup</TableHead>
              <TableHead className="text-right">R</TableHead>
              <TableHead className="text-right">P&L</TableHead>
              <TableHead>Result</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tradesQuery.isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-border-subtle">
                  {Array.from({ length: 8 }).map((__, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-16" /></TableCell>
                  ))}
                </TableRow>
              ))}

            {!tradesQuery.isLoading && filtered.length === 0 && (
              <TableRow className="border-border-subtle">
                <TableCell colSpan={8} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <IconNotebook size={32} className="text-text-muted" strokeWidth={1.25} />
                    <div className="text-body text-text-secondary">
                      {tradesQuery.data && tradesQuery.data.length > 0
                        ? "No trades match your filters"
                        : "No trades yet — log your first one"}
                    </div>
                    {(!tradesQuery.data || tradesQuery.data.length === 0) && (
                      <Button variant="outline" onClick={() => setOpen(true)}>
                        <IconPlus size={14} strokeWidth={2} />
                        Log trade
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}

            {filtered.map((t) => (
              <TradeRowView key={t.id} t={t} onDelete={() => del.mutate(t.id)} />
            ))}
          </TableBody>
        </Table>
      </div>

      <TradeFormDrawer
        open={open}
        onOpenChange={setOpen}
        accounts={accountsQuery.data ?? []}
      />
    </div>
  );
}

function TradeRowView({ t, onDelete }: { t: TradeRow; onDelete: () => void }) {
  return (
    <TableRow className="border-border-subtle hover:bg-bg-surface-hover">
      <TableCell className="whitespace-nowrap font-mono tabular-nums text-small text-text-secondary">
        {t.trade_date}
      </TableCell>
      <TableCell className="font-mono text-text-primary">{t.pair}</TableCell>
      <TableCell>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-micro uppercase tracking-wide",
            t.direction === "long"
              ? "bg-success-wash text-success-strong"
              : "bg-danger-wash text-danger-strong",
          )}
        >
          {t.direction}
        </span>
      </TableCell>
      <TableCell className="text-small text-text-secondary">{t.setup_type ?? "—"}</TableCell>
      <TableCell className="text-right font-mono tabular-nums">
        {t.r_multiple != null ? `${Number(t.r_multiple).toFixed(2)}R` : "—"}
      </TableCell>
      <TableCell
        className={cn(
          "text-right font-mono tabular-nums",
          Number(t.pnl ?? 0) > 0 && "text-success-strong",
          Number(t.pnl ?? 0) < 0 && "text-danger-strong",
        )}
      >
        {currency(t.pnl != null ? Number(t.pnl) : null)}
      </TableCell>
      <TableCell>
        {t.result ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-micro capitalize",
              t.result === "win" && "bg-success-wash text-success-strong",
              t.result === "loss" && "bg-danger-wash text-danger-strong",
              t.result === "breakeven" && "bg-bg-surface-raised text-text-secondary",
            )}
          >
            {t.rule_violation && <IconAlertTriangle size={10} strokeWidth={2} />}
            {t.result}
          </span>
        ) : (
          "—"
        )}
      </TableCell>
      <TableCell className="text-right">
        <button
          onClick={onDelete}
          className="rounded p-1.5 text-text-muted transition-colors hover:bg-danger-wash hover:text-danger-strong"
          aria-label="Delete trade"
        >
          <IconTrash size={14} strokeWidth={1.5} />
        </button>
      </TableCell>
    </TableRow>
  );
}
