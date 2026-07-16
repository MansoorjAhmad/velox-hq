import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createTrade, updateTrade, type TradeInput, type TradeRow } from "@/lib/trades.functions";
import type { TradingAccountRow } from "@/lib/trading-accounts.functions";

const TRADE_TYPES = ["long", "short"];
const STATUSES = ["open", "closed"];

function num(v: string): number | null {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function TradeFormDrawer({
  isOpen,
  onClose,
  onSuccess,
  trade,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  trade?: TradeRow | null;
}) {
  const qc = useQueryClient();
  const createFn = useServerFn(createTrade);
  const updateFn = useServerFn(updateTrade);

  const [form, setForm] = useState({
    symbol: trade?.symbol ?? "",
    entry_price: trade?.entry_price?.toString() ?? "",
    exit_price: trade?.exit_price?.toString() ?? "",
    quantity: trade?.quantity?.toString() ?? "",
    entry_date: trade?.entry_date ?? new Date().toISOString().slice(0, 10),
    exit_date: trade?.exit_date ?? "",
    trade_type: trade?.trade_type ?? "long",
    status: trade?.status ?? "open",
    profit_loss: trade?.profit_loss?.toString() ?? "",
    roi_percentage: trade?.roi_percentage?.toString() ?? "",
    risk_reward_ratio: trade?.risk_reward_ratio?.toString() ?? "",
    notes: trade?.notes ?? "",
    account_id: trade?.account_id ?? "",
  });

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const mutation = useMutation({
    mutationFn: async () => {
      if (!form.symbol.trim()) throw new Error("Symbol is required");
      if (!form.entry_price) throw new Error("Entry price is required");
      if (!form.quantity) throw new Error("Quantity is required");

      const input: TradeInput = {
        symbol: form.symbol.trim().toUpperCase(),
        entry_price: num(form.entry_price) || 0,
        exit_price: num(form.exit_price),
        quantity: num(form.quantity) || 0,
        entry_date: form.entry_date,
        exit_date: form.exit_date || null,
        trade_type: form.trade_type,
        status: form.status,
        profit_loss: num(form.profit_loss),
        roi_percentage: num(form.roi_percentage),
        risk_reward_ratio: num(form.risk_reward_ratio),
        notes: form.notes || null,
        account_id: form.account_id || null,
      };

      if (trade) {
        return updateFn({ id: trade.id, ...input });
      }
      return createFn(input);
    },
    onSuccess: () => {
      toast.success(trade ? "Trade updated" : "Trade logged");
      qc.invalidateQueries({ queryKey: ["trades"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      onSuccess?.();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-[520px]">
        <SheetHeader>
          <SheetTitle>{trade ? "Edit Trade" : "Log a Trade"}</SheetTitle>
          <SheetDescription>
            {trade ? "Update trade details" : "Record entry, exit, and profit/loss"}
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-4 px-4 py-6">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date *">
              <Input
                type="date"
                value={form.entry_date}
                onChange={(e) => update("entry_date", e.target.value)}
              />
            </Field>
            <Field label="Symbol *">
              <Input
                placeholder="EURUSD"
                value={form.symbol}
                onChange={(e) => update("symbol", e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <Select
                value={form.trade_type}
                onValueChange={(v) => update("trade_type", v)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TRADE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select
                value={form.status}
                onValueChange={(v) => update("status", v)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Entry Price *"><NumberInput value={form.entry_price} onChange={(v) => update("entry_price", v)} /></Field>
            <Field label="Quantity *"><NumberInput value={form.quantity} onChange={(v) => update("quantity", v)} /></Field>
            <Field label="Exit Price"><NumberInput value={form.exit_price} onChange={(v) => update("exit_price", v)} /></Field>
            <Field label="Exit Date"><Input type="date" value={form.exit_date} onChange={(e) => update("exit_date", e.target.value)} /></Field>
            <Field label="P&L ($)"><NumberInput value={form.profit_loss} onChange={(v) => update("profit_loss", v)} /></Field>
            <Field label="ROI %"><NumberInput value={form.roi_percentage} onChange={(v) => update("roi_percentage", v)} /></Field>
            <Field label="R:R Ratio"><NumberInput value={form.risk_reward_ratio} onChange={(v) => update("risk_reward_ratio", v)} /></Field>
          </div>

          <Field label="Notes">
            <Textarea
              rows={3}
              placeholder="Trade notes and observations..."
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
            />
          </Field>
        </div>

        <SheetFooter className="gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving…" : trade ? "Update" : "Add Trade"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-micro uppercase tracking-wide text-text-muted">{label}</Label>
      {children}
    </div>
  );
}

function NumberInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Input
      inputMode="decimal"
      type="number"
      step="any"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="font-mono tabular-nums"
    />
  );
}
