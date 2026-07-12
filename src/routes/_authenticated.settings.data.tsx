import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { IconDownload, IconDatabase } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { listTrades } from "@/lib/trades.functions";
import { listIncome } from "@/lib/income.functions";
import { listDebts } from "@/lib/debts.functions";
import { listGoals } from "@/lib/goals.functions";
import { listJournal } from "@/lib/journal.functions";

export const Route = createFileRoute("/_authenticated/settings/data")({
  component: DataSettingsPage,
});

function toCsv(rows: Array<Record<string, unknown>>): string {
  if (rows.length === 0) return "";
  const keys = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const esc = (v: unknown) => {
    if (v == null) return "";
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  return [keys.join(","), ...rows.map((r) => keys.map((k) => esc(r[k])).join(","))].join("\n");
}

function download(name: string, content: string, mime = "text/csv") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

function DataSettingsPage() {
  const trades = useServerFn(listTrades);
  const income = useServerFn(listIncome);
  const debts = useServerFn(listDebts);
  const goals = useServerFn(listGoals);
  const journal = useServerFn(listJournal);

  const t = useQuery({ queryKey: ["trades"], queryFn: () => trades() });
  const i = useQuery({ queryKey: ["income"], queryFn: () => income() });
  const d = useQuery({ queryKey: ["debts"], queryFn: () => debts() });
  const g = useQuery({ queryKey: ["goals"], queryFn: () => goals() });
  const j = useQuery({ queryKey: ["journal"], queryFn: () => journal() });

  const stamp = new Date().toISOString().slice(0, 10);

  const exports = [
    { label: "Trades", count: t.data?.length ?? 0, rows: t.data, name: `velox-trades-${stamp}.csv` },
    { label: "Income", count: i.data?.length ?? 0, rows: i.data, name: `velox-income-${stamp}.csv` },
    { label: "Debts", count: d.data?.length ?? 0, rows: d.data, name: `velox-debts-${stamp}.csv` },
    { label: "Goals", count: g.data?.length ?? 0, rows: g.data, name: `velox-goals-${stamp}.csv` },
    { label: "Reflections", count: j.data?.length ?? 0, rows: j.data, name: `velox-reflections-${stamp}.csv` },
  ];

  const exportAll = () => {
    const bundle = {
      exported_at: new Date().toISOString(),
      trades: t.data ?? [],
      income: i.data ?? [],
      debts: d.data ?? [],
      goals: g.data ?? [],
      journal: j.data ?? [],
    };
    download(`velox-backup-${stamp}.json`, JSON.stringify(bundle, null, 2), "application/json");
    toast.success("Backup downloaded");
  };

  return (
    <div className="max-w-[720px] space-y-6">
      <section className="rounded-lg border border-border-subtle bg-bg-surface p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-h3 text-text-primary">
              <IconDatabase size={18} strokeWidth={1.5} /> Full backup
            </h2>
            <p className="mt-1 text-small text-text-secondary">
              Download every record as a single JSON file.
            </p>
          </div>
          <Button onClick={exportAll}>
            <IconDownload size={14} strokeWidth={2} /> Download JSON
          </Button>
        </div>
      </section>

      <section className="rounded-lg border border-border-subtle bg-bg-surface p-5">
        <h2 className="text-h3 text-text-primary">CSV exports</h2>
        <p className="mt-1 text-small text-text-secondary">Per-table CSV, includes all rows.</p>
        <div className="mt-4 divide-y divide-border-subtle">
          {exports.map((e) => (
            <div key={e.label} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div>
                <div className="text-body text-text-primary">{e.label}</div>
                <div className="text-micro text-text-muted">
                  <span className="font-mono tabular-nums">{e.count}</span> row{e.count === 1 ? "" : "s"}
                </div>
              </div>
              <Button
                variant="outline" size="sm"
                disabled={!e.rows || e.rows.length === 0}
                onClick={() => download(e.name, toCsv(e.rows as Array<Record<string, unknown>>))}
              >
                <IconDownload size={14} strokeWidth={2} /> CSV
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
