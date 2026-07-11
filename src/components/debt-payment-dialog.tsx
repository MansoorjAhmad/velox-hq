import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { recordDebtPayment, type DebtRow } from "@/lib/debts.functions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debt: DebtRow | null;
}

export function DebtPaymentDialog({ open, onOpenChange, debt }: Props) {
  const qc = useQueryClient();
  const payFn = useServerFn(recordDebtPayment);
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      if (!debt) throw new Error("No debt selected");
      if (!(amount > 0)) throw new Error("Amount must be positive");
      return payFn({
        data: { debt_id: debt.id, amount, payment_date: date, notes: notes || null },
      });
    },
    onSuccess: () => {
      toast.success("Payment recorded");
      qc.invalidateQueries({ queryKey: ["debts"] });
      qc.invalidateQueries({ queryKey: ["debt-payments"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setAmount(0);
      setNotes("");
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remaining = debt
    ? Math.max(0, Number(debt.total_owed) - Number(debt.amount_repaid ?? 0))
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
          <DialogDescription>
            {debt ? (
              <>
                {debt.creditor_name} · remaining{" "}
                <span className="font-mono tabular-nums">
                  {remaining.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                </span>
              </>
            ) : (
              "Select a debt"
            )}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pnotes">Notes</Label>
            <Textarea
              id="pnotes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving…" : "Record payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
