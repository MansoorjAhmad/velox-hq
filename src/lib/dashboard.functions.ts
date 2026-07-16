import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type DashboardMetrics = {
  netWorth: number;
  totalDebt: number;
  monthlyIncome: number;
  tradingPnl: number;
  deltas: {
    netWorth: number;
    totalDebt: number;
    monthlyIncome: number;
    tradingPnl: number;
  };
};

function pctChange(current: number, previous: number): number {
  if (previous === 0) {
    if (current === 0) return 0;
    return current > 0 ? 100 : -100;
  }
  return ((current - previous) / Math.abs(previous)) * 100;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export const getDashboardMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DashboardMetrics> => {
    const { supabase, userId } = context;

    const today = new Date();
    const startCurrent = new Date(today);
    startCurrent.setDate(startCurrent.getDate() - 30);
    const startPrev = new Date(today);
    startPrev.setDate(startPrev.getDate() - 60);

    const [accountsRes, debtsRes, incomeCurRes, incomePrevRes, tradesCurRes, tradesPrevRes] =
      await Promise.all([
        supabase.from("trading_accounts").select("current_balance").eq("user_id", userId),
        supabase.from("debts").select("original_amount, remaining_balance").eq("user_id", userId),
        supabase
          .from("income_entries")
          .select("amount")
          .eq("user_id", userId)
          .gte("entry_date", isoDate(startCurrent)),
        supabase
          .from("income_entries")
          .select("amount")
          .eq("user_id", userId)
          .gte("entry_date", isoDate(startPrev))
          .lt("entry_date", isoDate(startCurrent)),
        supabase
          .from("trades")
          .select("profit_loss")
          .eq("user_id", userId)
          .gte("entry_date", isoDate(startCurrent)),
        supabase
          .from("trades")
          .select("profit_loss")
          .eq("user_id", userId)
          .gte("entry_date", isoDate(startPrev))
          .lt("entry_date", isoDate(startCurrent)),
      ]);

    const sum = (rows: Array<Record<string, number | null>> | null, key: string) =>
      (rows ?? []).reduce((acc, r) => acc + Number(r[key] ?? 0), 0);

    const accountBalance = sum(accountsRes.data as any, "current_balance");
    const totalDebt = sum(debtsRes.data as any, "remaining_balance");
    const netWorth = accountBalance - totalDebt;

    const monthlyIncome = sum(incomeCurRes.data as any, "amount");
    const monthlyIncomePrev = sum(incomePrevRes.data as any, "amount");
    const tradingPnl = sum(tradesCurRes.data as any, "profit_loss");
    const tradingPnlPrev = sum(tradesPrevRes.data as any, "profit_loss");

    // Net worth and debt deltas: we don't have historical snapshots — use trading pnl + income - debt payments in prev 30d as a proxy movement.
    // For an honest first pass, report 0% until snapshotting exists.
    return {
      netWorth,
      totalDebt,
      monthlyIncome,
      tradingPnl,
      deltas: {
        netWorth: 0,
        totalDebt: 0,
        monthlyIncome: pctChange(monthlyIncome, monthlyIncomePrev),
        tradingPnl: pctChange(tradingPnl, tradingPnlPrev),
      },
    };
  });
