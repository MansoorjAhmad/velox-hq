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
import { createTrade, type TradeInput } from "@/lib/trades.functions";
import type { TradingAccountRow } from "@/lib/trading-accounts.functions";

const SESSIONS = ["Asia", "London", "NY AM", "NY PM"];
const SETUPS = ["Breakout", "Reversal", "Trend continuation", "Range", "Other"];
const RESULTS = ["win", "loss", "breakeven"];

function num(v: string): number | null {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function TradeFormDrawer({
  open,
  onOpenChange,
  accounts,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  accounts: TradingAccountRow[];
}) {
  const qc = useQueryClient();
  const createFn = useServerFn(createTrade);
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const [form, setForm] = useState({
    trade_date: new Date().toISOString().slice(0, 10),
    pair: "",
    direction: "long" as "long" | "short",
    session: "",
    setup_type: "",
    entry_price: "",
    exit_price: "",
    stop_loss: "",
    take_profit: "",
    lot_size: "",
    risk_percent: "",
    result: "",
    pnl: "",
    r_multiple: "",
    rule_violation: false,
    notes: "",
    account_id: accounts[0]?.id ?? "",
  });

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const reset = () => {
    setForm({
      trade_date: new Date().toISOString().slice(0, 10),
      pair: "",
      direction: "long",
      session: "",
      setup_type: "",
      entry_price: "",
      exit_price: "",
      stop_loss: "",
      take_profit: "",
      lot_size: "",
      risk_percent: "",
      result: "",
      pnl: "",
      r_multiple: "",
      rule_violation: false,
      notes: "",
      account_id: accounts[0]?.id ?? "",
    });
    setScreenshot(null);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!form.pair.trim()) throw new Error("Pair is required");
      let screenshot_path: string | null = null;

      if (screenshot) {
        const { data: userData } = await supabase.auth.getUser();
        const uid = userData.user?.id;
        if (!uid) throw new Error("Not authenticated");
        const ext = screenshot.name.split(".").pop() || "png";
        const path = `${uid}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("trade-screenshots")
          .upload(path, screenshot, { upsert: false });
        if (upErr) throw new Error(upErr.message);
        screenshot_path = path;
      }

      const input: TradeInput = {
        trade_date: form.trade_date,
        pair: form.pair.trim().toUpperCase(),
        direction: form.direction,
        session: form.session || null,
        setup_type: form.setup_type || null,
        entry_price: num(form.entry_price),
        exit_price: num(form.exit_price),
        stop_loss: num(form.stop_loss),
        take_profit: num(form.take_profit),
        lot_size: num(form.lot_size),
        risk_percent: num(form.risk_percent),
        result: form.result || null,
        pnl: num(form.pnl),
        r_multiple: num(form.r_multiple),
        rule_violation: form.rule_violation,
        notes: form.notes || null,
        screenshot_path,
        account_id: form.account_id || null,
      };
      return createFn({ data: input });
    },
    onSuccess: () => {
      toast.success("Trade logged");
      qc.invalidateQueries({ queryKey: ["trades"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      reset();
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-[520px]">
        <SheetHeader>
          <SheetTitle>Log a trade</SheetTitle>
          <SheetDescription>Record entry, exit, and reflection.</SheetDescription>
        </SheetHeader>

        <div className="grid gap-4 px-4 py-6">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date">
              <Input
                type="date"
                value={form.trade_date}
                onChange={(e) => update("trade_date", e.target.value)}
              />
            </Field>
            <Field label="Pair *">
              <Input
                placeholder="EURUSD"
                value={form.pair}
                onChange={(e) => update("pair", e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Direction">
              <Select
                value={form.direction}
                onValueChange={(v) => update("direction", v as "long" | "short")}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="long">Long</SelectItem>
                  <SelectItem value="short">Short</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Result">
              <Select value={form.result} onValueChange={(v) => update("result", v)}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  {RESULTS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Session">
              <Select value={form.session} onValueChange={(v) => update("session", v)}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  {SESSIONS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Setup">
              <Select value={form.setup_type} onValueChange={(v) => update("setup_type", v)}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  {SETUPS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          {accounts.length > 0 && (
            <Field label="Account">
              <Select value={form.account_id} onValueChange={(v) => update("account_id", v)}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Entry"><NumberInput value={form.entry_price} onChange={(v) => update("entry_price", v)} /></Field>
            <Field label="Exit"><NumberInput value={form.exit_price} onChange={(v) => update("exit_price", v)} /></Field>
            <Field label="Stop loss"><NumberInput value={form.stop_loss} onChange={(v) => update("stop_loss", v)} /></Field>
            <Field label="Take profit"><NumberInput value={form.take_profit} onChange={(v) => update("take_profit", v)} /></Field>
            <Field label="Lot size"><NumberInput value={form.lot_size} onChange={(v) => update("lot_size", v)} /></Field>
            <Field label="Risk %"><NumberInput value={form.risk_percent} onChange={(v) => update("risk_percent", v)} /></Field>
            <Field label="P&L ($)"><NumberInput value={form.pnl} onChange={(v) => update("pnl", v)} /></Field>
            <Field label="R multiple"><NumberInput value={form.r_multiple} onChange={(v) => update("r_multiple", v)} /></Field>
          </div>

          <Field label="Notes">
            <Textarea
              rows={3}
              placeholder="What went well? What didn't?"
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
            />
          </Field>

          <Field label="Screenshot">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setScreenshot(e.target.files?.[0] ?? null)}
            />
          </Field>

          <label className="flex items-center justify-between rounded-md border border-border-subtle bg-bg-surface px-3 py-2">
            <span className="text-label text-text-secondary">Rule violation</span>
            <Switch
              checked={form.rule_violation}
              onCheckedChange={(v) => update("rule_violation", v)}
            />
          </label>
        </div>

        <SheetFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving…" : "Save trade"}
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
