import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createIncome,
  updateIncome,
  type IncomeInput,
  type IncomeRow,
} from "@/lib/income.functions";

const SOURCES = ["trading", "salary", "freelance", "business", "other"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: IncomeRow | null;
}

export function IncomeFormDrawer({ open, onOpenChange, entry }: Props) {
  const qc = useQueryClient();
  const createFn = useServerFn(createIncome);
  const updateFn = useServerFn(updateIncome);

  const [form, setForm] = useState<IncomeInput>({
    entry_date: new Date().toISOString().slice(0, 10),
    source: "trading",
    amount: 0,
    allocated_to_debt: 0,
    allocated_to_reinvestment: 0,
    notes: "",
  });

  useEffect(() => {
    if (entry) {
      setForm({
        entry_date: entry.entry_date,
        source: entry.source,
        amount: Number(entry.amount),
        allocated_to_debt: Number(entry.allocated_to_debt ?? 0),
        allocated_to_reinvestment: Number(entry.allocated_to_reinvestment ?? 0),
        notes: entry.notes ?? "",
      });
    } else if (open) {
      setForm({
        entry_date: new Date().toISOString().slice(0, 10),
        source: "trading",
        amount: 0,
        allocated_to_debt: 0,
        allocated_to_reinvestment: 0,
        notes: "",
      });
    }
  }, [entry, open]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!(form.amount > 0)) throw new Error("Amount must be positive");
      if (!form.source) throw new Error("Source is required");
      if (entry) return updateFn({ data: { id: entry.id, patch: form } });
      return createFn({ data: form });
    },
    onSuccess: () => {
      toast.success(entry ? "Entry updated" : "Income added");
      qc.invalidateQueries({ queryKey: ["income"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const set = <K extends keyof IncomeInput>(k: K, v: IncomeInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const remaining =
    Number(form.amount) -
    Number(form.allocated_to_debt ?? 0) -
    Number(form.allocated_to_reinvestment ?? 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{entry ? "Edit income" : "New income"}</SheetTitle>
          <SheetDescription>
            Log incoming funds and allocate toward debt or reinvestment.
          </SheetDescription>
        </SheetHeader>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={form.entry_date}
                onChange={(e) => set("entry_date", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Source</Label>
              <Select value={form.source} onValueChange={(v) => set("source", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOURCES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(e) => set("amount", Number(e.target.value))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="debt">Allocate to debt</Label>
              <Input
                id="debt"
                type="number"
                step="0.01"
                value={form.allocated_to_debt ?? 0}
                onChange={(e) => set("allocated_to_debt", Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reinvest">Allocate to reinvest</Label>
              <Input
                id="reinvest"
                type="number"
                step="0.01"
                value={form.allocated_to_reinvestment ?? 0}
                onChange={(e) =>
                  set("allocated_to_reinvestment", Number(e.target.value))
                }
              />
            </div>
          </div>

          <div className="rounded-md border border-border-subtle bg-bg-surface-raised px-3 py-2 text-small text-text-secondary">
            Unallocated:{" "}
            <span className="font-mono tabular-nums text-text-primary">
              {remaining.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              value={form.notes ?? ""}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving…" : entry ? "Save changes" : "Add income"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
