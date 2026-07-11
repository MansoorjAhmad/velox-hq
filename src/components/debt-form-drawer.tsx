import { useState, useEffect } from "react";
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
  createDebt,
  updateDebt,
  type DebtInput,
  type DebtRow,
} from "@/lib/debts.functions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debt?: DebtRow | null;
}

export function DebtFormDrawer({ open, onOpenChange, debt }: Props) {
  const qc = useQueryClient();
  const createFn = useServerFn(createDebt);
  const updateFn = useServerFn(updateDebt);

  const [form, setForm] = useState<DebtInput>({
    creditor_name: "",
    total_owed: 0,
    amount_repaid: 0,
    priority: 3,
    notes: "",
  });

  useEffect(() => {
    if (debt) {
      setForm({
        creditor_name: debt.creditor_name,
        total_owed: Number(debt.total_owed),
        amount_repaid: Number(debt.amount_repaid ?? 0),
        priority: debt.priority ?? 3,
        notes: debt.notes ?? "",
      });
    } else if (open) {
      setForm({
        creditor_name: "",
        total_owed: 0,
        amount_repaid: 0,
        priority: 3,
        notes: "",
      });
    }
  }, [debt, open]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!form.creditor_name.trim()) throw new Error("Creditor is required");
      if (!(form.total_owed > 0)) throw new Error("Total owed must be positive");
      if (debt) {
        return updateFn({ data: { id: debt.id, patch: form } });
      }
      return createFn({ data: form });
    },
    onSuccess: () => {
      toast.success(debt ? "Debt updated" : "Debt added");
      qc.invalidateQueries({ queryKey: ["debts"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const set = <K extends keyof DebtInput>(k: K, v: DebtInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{debt ? "Edit debt" : "New debt"}</SheetTitle>
          <SheetDescription>
            Track a creditor, balance owed, and priority for payoff.
          </SheetDescription>
        </SheetHeader>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="creditor">Creditor</Label>
            <Input
              id="creditor"
              value={form.creditor_name}
              onChange={(e) => set("creditor_name", e.target.value)}
              placeholder="e.g. Chase Card"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="total">Total owed</Label>
              <Input
                id="total"
                type="number"
                step="0.01"
                value={form.total_owed}
                onChange={(e) => set("total_owed", Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repaid">Already repaid</Label>
              <Input
                id="repaid"
                type="number"
                step="0.01"
                value={form.amount_repaid ?? 0}
                onChange={(e) => set("amount_repaid", Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority (1 = highest)</Label>
            <Input
              id="priority"
              type="number"
              min={1}
              max={10}
              value={form.priority ?? 3}
              onChange={(e) => set("priority", Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              value={form.notes ?? ""}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="APR, minimum payment, terms…"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving…" : debt ? "Save changes" : "Add debt"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
