import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IconPlus, IconWallet } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  listTradingAccounts, createTradingAccount,
} from "@/lib/trading-accounts.functions";

export const Route = createFileRoute("/_authenticated/settings/accounts")({
  component: AccountsSettingsPage,
});

const currency = (n: number | null | undefined) =>
  n == null ? "—" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(n));

function AccountsSettingsPage() {
  const fetch = useServerFn(listTradingAccounts);
  const q = useQuery({ queryKey: ["trading-accounts"], queryFn: () => fetch() });
  const [open, setOpen] = useState(false);

  const accounts = q.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-body text-text-secondary">
          {accounts.length} account{accounts.length === 1 ? "" : "s"} tracked
        </p>
        <Button onClick={() => setOpen(true)}>
          <IconPlus size={16} strokeWidth={2} /> Add account
        </Button>
      </div>

      {q.isLoading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : accounts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-border-subtle bg-bg-surface p-12 text-center">
          <IconWallet size={32} className="text-text-muted" strokeWidth={1.25} />
          <div className="text-body text-text-secondary">No trading accounts yet.</div>
          <Button variant="outline" onClick={() => setOpen(true)}>
            <IconPlus size={14} strokeWidth={2} /> Add your first
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {accounts.map((a) => (
            <div key={a.id} className="rounded-lg border border-border-subtle bg-bg-surface p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-h3 text-text-primary">{a.name}</div>
                  <div className="mt-1 flex items-center gap-2 text-small text-text-secondary">
                    <span className="capitalize">{a.account_type}</span>
                    {a.phase && <span>· {a.phase}</span>}
                    {a.status && (
                      <span className="rounded-full bg-bg-surface-raised px-2 py-0.5 text-micro capitalize">
                        {a.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <div className="text-micro text-text-muted">Current balance</div>
                  <div className="font-mono tabular-nums text-body text-text-primary">
                    {currency(a.current_balance)}
                  </div>
                </div>
                <div>
                  <div className="text-micro text-text-muted">Starting</div>
                  <div className="font-mono tabular-nums text-body text-text-secondary">
                    {currency(a.starting_balance)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AccountDrawer open={open} onOpenChange={setOpen} />
    </div>
  );
}

function AccountDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const createFn = useServerFn(createTradingAccount);
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [type, setType] = useState("live");
  const [phase, setPhase] = useState("");
  const [starting, setStarting] = useState<number>(0);

  const m = useMutation({
    mutationFn: () => createFn({ data: { name, account_type: type, starting_balance: starting, current_balance: starting, phase: phase || null } }),
    onSuccess: () => {
      toast.success("Account added");
      qc.invalidateQueries({ queryKey: ["trading-accounts"] });
      onOpenChange(false);
      setName(""); setType("live"); setPhase(""); setStarting(0);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>New trading account</SheetTitle>
          <SheetDescription>Track balances across prop firms and personal accounts.</SheetDescription>
        </SheetHeader>
        <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); if (!name.trim()) return toast.error("Name is required"); m.mutate(); }}>
          <div className="space-y-2">
            <Label htmlFor="n">Name</Label>
            <Input id="n" value={name} onChange={(e) => setName(e.target.value)} placeholder="FTMO $100k" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="demo">Demo</SelectItem>
                  <SelectItem value="prop">Prop firm</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="p">Phase</Label>
              <Input id="p" value={phase} onChange={(e) => setPhase(e.target.value)} placeholder="Challenge / Funded" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="s">Starting balance</Label>
            <Input id="s" type="number" step="0.01" value={starting} onChange={(e) => setStarting(Number(e.target.value))} />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={m.isPending}>{m.isPending ? "Saving…" : "Add account"}</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
