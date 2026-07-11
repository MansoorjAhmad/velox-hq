import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IconPlus,
  IconTrash,
  IconPencil,
  IconCoin,
  IconTrendingUp,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { MetricCard } from "@/components/metric-card";
import { IncomeFormDrawer } from "@/components/income-form-drawer";
import { listIncome, deleteIncome, type IncomeRow } from "@/lib/income.functions";

export const Route = createFileRoute("/_authenticated/income")({
  component: IncomePage,
});

const currency = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

const currencyPrecise = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);

function IncomePage() {
  const fetchIncome = useServerFn(listIncome);
  const deleteFn = useServerFn(deleteIncome);
  const qc = useQueryClient();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<IncomeRow | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  const q = useQuery({ queryKey: ["income"], queryFn: () => fetchIncome() });

  const del = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Entry deleted");
      qc.invalidateQueries({ queryKey: ["income"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = q.data ?? [];
  const filtered = useMemo(
    () => (sourceFilter === "all" ? rows : rows.filter((r) => r.source === sourceFilter)),
    [rows, sourceFilter],
  );

  const kpis = useMemo(() => {
    const now = new Date();
    const start30 = new Date(now);
    start30.setDate(start30.getDate() - 30);
    const startPrev = new Date(now);
    startPrev.setDate(startPrev.getDate() - 60);

    let total = 0;
    let last30 = 0;
    let prev30 = 0;
    let debtAlloc = 0;
    let reinvestAlloc = 0;
    for (const r of rows) {
      const amt = Number(r.amount);
      total += amt;
      const d = new Date(r.entry_date);
      if (d >= start30) last30 += amt;
      else if (d >= startPrev) prev30 += amt;
      debtAlloc += Number(r.allocated_to_debt ?? 0);
      reinvestAlloc += Number(r.allocated_to_reinvestment ?? 0);
    }
    const delta =
      prev30 === 0 ? (last30 > 0 ? 100 : 0) : ((last30 - prev30) / prev30) * 100;
    return { total, last30, prev30, debtAlloc, reinvestAlloc, delta };
  }, [rows]);

  const openNew = () => {
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (e: IncomeRow) => {
    setEditing(e);
    setOpen(true);
  };

  const sources = useMemo(
    () => Array.from(new Set(rows.map((r) => r.source))).sort(),
    [rows],
  );

  return (
    <div className="mx-auto w-full max-w-[1400px] p-4 md:p-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h1 text-text-primary">Income</h1>
          <p className="mt-1 text-body text-text-secondary">
            {rows.length} entr{rows.length === 1 ? "y" : "ies"} · Lifetime{" "}
            <span className="font-mono tabular-nums">{currencyPrecise(kpis.total)}</span>
          </p>
        </div>
        <Button onClick={openNew}>
          <IconPlus size={16} strokeWidth={2} />
          Log income
        </Button>
      </header>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Last 30 days"
          value={currency(kpis.last30)}
          delta={{ value: kpis.delta, label: "vs prev 30d" }}
          icon={<IconCoin size={16} strokeWidth={1.5} />}
          loading={q.isLoading}
        />
        <MetricCard
          label="Lifetime"
          value={currency(kpis.total)}
          loading={q.isLoading}
        />
        <MetricCard
          label="To Debt"
          value={currency(kpis.debtAlloc)}
          loading={q.isLoading}
        />
        <MetricCard
          label="To Reinvest"
          value={currency(kpis.reinvestAlloc)}
          icon={<IconTrendingUp size={16} strokeWidth={1.5} />}
          loading={q.isLoading}
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            {sources.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-lg border border-border-subtle bg-bg-surface">
        <Table>
          <TableHeader>
            <TableRow className="border-border-subtle">
              <TableHead>Date</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">To Debt</TableHead>
              <TableHead className="text-right">To Reinvest</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {q.isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i} className="border-border-subtle">
                  {Array.from({ length: 7 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!q.isLoading && filtered.length === 0 && (
              <TableRow className="border-border-subtle">
                <TableCell colSpan={7} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <IconCoin size={32} className="text-text-muted" strokeWidth={1.25} />
                    <div className="text-body text-text-secondary">
                      {rows.length > 0
                        ? "No entries match your filter"
                        : "No income logged yet"}
                    </div>
                    {rows.length === 0 && (
                      <Button variant="outline" onClick={openNew}>
                        <IconPlus size={14} strokeWidth={2} />
                        Log first entry
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}

            {filtered.map((r) => (
              <TableRow
                key={r.id}
                className="border-border-subtle hover:bg-bg-surface-hover"
              >
                <TableCell className="whitespace-nowrap font-mono text-small text-text-secondary tabular-nums">
                  {r.entry_date}
                </TableCell>
                <TableCell>
                  <span className="rounded-full bg-bg-surface-raised px-2 py-0.5 text-micro capitalize text-text-secondary">
                    {r.source}
                  </span>
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums text-success-strong">
                  {currencyPrecise(Number(r.amount))}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums text-text-secondary">
                  {r.allocated_to_debt
                    ? currencyPrecise(Number(r.allocated_to_debt))
                    : "—"}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums text-text-secondary">
                  {r.allocated_to_reinvestment
                    ? currencyPrecise(Number(r.allocated_to_reinvestment))
                    : "—"}
                </TableCell>
                <TableCell className="max-w-[240px] truncate text-small text-text-muted">
                  {r.notes ?? "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => openEdit(r)}
                      className="rounded p-1.5 text-text-muted transition-colors hover:bg-bg-surface-raised hover:text-text-primary"
                      aria-label="Edit"
                    >
                      <IconPencil size={14} strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Delete this entry?")) del.mutate(r.id);
                      }}
                      className="rounded p-1.5 text-text-muted transition-colors hover:bg-danger-wash hover:text-danger-strong"
                      aria-label="Delete"
                    >
                      <IconTrash size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <IncomeFormDrawer open={open} onOpenChange={setOpen} entry={editing} />
    </div>
  );
}
