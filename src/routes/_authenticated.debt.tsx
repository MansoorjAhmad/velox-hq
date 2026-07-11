import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IconPlus,
  IconTrash,
  IconPencil,
  IconCash,
  IconCreditCard,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { MetricCard } from "@/components/metric-card";
import { DebtFormDrawer } from "@/components/debt-form-drawer";
import { DebtPaymentDialog } from "@/components/debt-payment-dialog";
import {
  listDebts,
  listDebtPayments,
  deleteDebt,
  type DebtRow,
} from "@/lib/debts.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/debt")({
  component: DebtPage,
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

function DebtPage() {
  const fetchDebts = useServerFn(listDebts);
  const fetchPayments = useServerFn(listDebtPayments);
  const deleteFn = useServerFn(deleteDebt);
  const qc = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DebtRow | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [payTarget, setPayTarget] = useState<DebtRow | null>(null);

  const debtsQ = useQuery({ queryKey: ["debts"], queryFn: () => fetchDebts() });
  const paymentsQ = useQuery({
    queryKey: ["debt-payments"],
    queryFn: () => fetchPayments(),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Debt deleted");
      qc.invalidateQueries({ queryKey: ["debts"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const kpis = useMemo(() => {
    const rows = debtsQ.data ?? [];
    const owed = rows.reduce((s, d) => s + Number(d.total_owed), 0);
    const repaid = rows.reduce((s, d) => s + Number(d.amount_repaid ?? 0), 0);
    const remaining = Math.max(0, owed - repaid);
    const pct = owed > 0 ? (repaid / owed) * 100 : 0;

    const payments = paymentsQ.data ?? [];
    const now = new Date();
    const start30 = new Date(now);
    start30.setDate(start30.getDate() - 30);
    const paidLast30 = payments
      .filter((p) => new Date(p.payment_date) >= start30)
      .reduce((s, p) => s + Number(p.amount), 0);

    return {
      owed,
      repaid,
      remaining,
      pct,
      paidLast30,
      count: rows.length,
    };
  }, [debtsQ.data, paymentsQ.data]);

  const openEdit = (d: DebtRow) => {
    setEditing(d);
    setFormOpen(true);
  };
  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openPay = (d: DebtRow) => {
    setPayTarget(d);
    setPayOpen(true);
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] p-4 md:p-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h1 text-text-primary">Debt Tracker</h1>
          <p className="mt-1 text-body text-text-secondary">
            {kpis.count} creditor{kpis.count === 1 ? "" : "s"} · {kpis.pct.toFixed(1)}% paid off
          </p>
        </div>
        <Button onClick={openNew}>
          <IconPlus size={16} strokeWidth={2} />
          Add debt
        </Button>
      </header>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Owed"
          value={currency(kpis.owed)}
          icon={<IconCreditCard size={16} strokeWidth={1.5} />}
          loading={debtsQ.isLoading}
        />
        <MetricCard
          label="Remaining"
          value={currency(kpis.remaining)}
          loading={debtsQ.isLoading}
        />
        <MetricCard
          label="Total Repaid"
          value={currency(kpis.repaid)}
          loading={debtsQ.isLoading}
        />
        <MetricCard
          label="Paid (30d)"
          value={currency(kpis.paidLast30)}
          icon={<IconCash size={16} strokeWidth={1.5} />}
          loading={paymentsQ.isLoading}
        />
      </div>

      <div className="mb-6 rounded-lg border border-border-subtle bg-bg-surface p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-micro text-text-muted">Overall payoff progress</span>
          <span className="font-mono tabular-nums text-small text-text-secondary">
            {currencyPrecise(kpis.repaid)} / {currencyPrecise(kpis.owed)}
          </span>
        </div>
        <Progress value={kpis.pct} className="h-2" />
      </div>

      <div className="overflow-hidden rounded-lg border border-border-subtle bg-bg-surface">
        <Table>
          <TableHeader>
            <TableRow className="border-border-subtle">
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead>Creditor</TableHead>
              <TableHead className="text-right">Owed</TableHead>
              <TableHead className="text-right">Repaid</TableHead>
              <TableHead className="text-right">Remaining</TableHead>
              <TableHead className="w-[220px]">Progress</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {debtsQ.isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i} className="border-border-subtle">
                  {Array.from({ length: 7 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!debtsQ.isLoading && (debtsQ.data?.length ?? 0) === 0 && (
              <TableRow className="border-border-subtle">
                <TableCell colSpan={7} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <IconCreditCard
                      size={32}
                      className="text-text-muted"
                      strokeWidth={1.25}
                    />
                    <div className="text-body text-text-secondary">
                      No debts tracked yet
                    </div>
                    <Button variant="outline" onClick={openNew}>
                      <IconPlus size={14} strokeWidth={2} />
                      Add your first debt
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {(debtsQ.data ?? []).map((d) => {
              const owed = Number(d.total_owed);
              const repaid = Number(d.amount_repaid ?? 0);
              const remaining = Math.max(0, owed - repaid);
              const pct = owed > 0 ? (repaid / owed) * 100 : 0;
              const done = remaining === 0 && owed > 0;
              return (
                <TableRow key={d.id} className="border-border-subtle hover:bg-bg-surface-hover">
                  <TableCell className="text-center font-mono text-small text-text-muted">
                    {d.priority ?? "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-text-primary">{d.creditor_name}</span>
                      {d.notes && (
                        <span className="text-small text-text-muted">{d.notes}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {currencyPrecise(owed)}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-success-strong">
                    {currencyPrecise(repaid)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-mono tabular-nums",
                      done ? "text-success-strong" : "text-text-primary",
                    )}
                  >
                    {done ? "Paid off" : currencyPrecise(remaining)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={pct} className="h-1.5" />
                      <span className="w-12 text-right font-mono text-micro tabular-nums text-text-muted">
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openPay(d)}
                        className="rounded p-1.5 text-text-muted transition-colors hover:bg-success-wash hover:text-success-strong"
                        aria-label="Record payment"
                        title="Record payment"
                      >
                        <IconCash size={14} strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => openEdit(d)}
                        className="rounded p-1.5 text-text-muted transition-colors hover:bg-bg-surface-raised hover:text-text-primary"
                        aria-label="Edit"
                      >
                        <IconPencil size={14} strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete ${d.creditor_name}? This cannot be undone.`)) {
                            del.mutate(d.id);
                          }
                        }}
                        className="rounded p-1.5 text-text-muted transition-colors hover:bg-danger-wash hover:text-danger-strong"
                        aria-label="Delete"
                      >
                        <IconTrash size={14} strokeWidth={1.5} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <DebtFormDrawer open={formOpen} onOpenChange={setFormOpen} debt={editing} />
      <DebtPaymentDialog open={payOpen} onOpenChange={setPayOpen} debt={payTarget} />
    </div>
  );
}
