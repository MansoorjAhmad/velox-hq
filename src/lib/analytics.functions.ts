import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type EquityPoint = { date: string; equity: number; pnl: number };
export type BreakdownRow = { key: string; trades: number; wins: number; losses: number; pnl: number; winRate: number };

export type AnalyticsPayload = {
  range: number;
  totals: {
    trades: number;
    wins: number;
    losses: number;
    breakeven: number;
    winRate: number;
    netPnl: number;
    grossWin: number;
    grossLoss: number;
    profitFactor: number;
    avgWin: number;
    avgLoss: number;
    expectancy: number;
    avgR: number;
    ruleViolations: number;
    maxDrawdown: number;
    bestTrade: number;
    worstTrade: number;
    longestWinStreak: number;
    longestLossStreak: number;
  };
  equityCurve: EquityPoint[];
  bySession: BreakdownRow[];
  bySetup: BreakdownRow[];
  byPair: BreakdownRow[];
  byDayOfWeek: BreakdownRow[];
};

function iso(d: Date) { return d.toISOString().slice(0, 10); }

export const getAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { days?: number }) => ({ days: data?.days ?? 90 }))
  .handler(async ({ data, context }): Promise<AnalyticsPayload> => {
    const { supabase, userId } = context;
    const days = data.days;
    const start = new Date();
    start.setDate(start.getDate() - days);

    const { data: rows, error } = await supabase
      .from("trades")
      .select("trade_date, pair, direction, session, setup_type, result, pnl, r_multiple, rule_violation")
      .eq("user_id", userId)
      .gte("trade_date", iso(start))
      .order("trade_date", { ascending: true });
    if (error) throw new Error(error.message);

    const trades = (rows ?? []) as Array<{
      trade_date: string; pair: string; direction: string; session: string | null;
      setup_type: string | null; result: string | null; pnl: number | null;
      r_multiple: number | null; rule_violation: boolean | null;
    }>;

    let wins = 0, losses = 0, breakeven = 0, grossWin = 0, grossLoss = 0;
    let ruleViolations = 0, rSum = 0, rCount = 0;
    let best = 0, worst = 0;
    let curWinStreak = 0, curLossStreak = 0, longestWin = 0, longestLoss = 0;

    for (const t of trades) {
      const pnl = Number(t.pnl ?? 0);
      if (t.result === "win") { wins++; grossWin += pnl; curWinStreak++; curLossStreak = 0; longestWin = Math.max(longestWin, curWinStreak); }
      else if (t.result === "loss") { losses++; grossLoss += Math.abs(pnl); curLossStreak++; curWinStreak = 0; longestLoss = Math.max(longestLoss, curLossStreak); }
      else if (t.result === "breakeven") { breakeven++; curWinStreak = 0; curLossStreak = 0; }
      if (t.rule_violation) ruleViolations++;
      if (t.r_multiple != null) { rSum += Number(t.r_multiple); rCount++; }
      if (pnl > best) best = pnl;
      if (pnl < worst) worst = pnl;
    }

    const netPnl = grossWin - grossLoss;
    const decided = wins + losses;
    const winRate = decided > 0 ? (wins / decided) * 100 : 0;
    const profitFactor = grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? Infinity : 0;
    const avgWin = wins > 0 ? grossWin / wins : 0;
    const avgLoss = losses > 0 ? grossLoss / losses : 0;
    const expectancy = trades.length > 0 ? netPnl / trades.length : 0;
    const avgR = rCount > 0 ? rSum / rCount : 0;

    // Equity curve + drawdown
    let equity = 0;
    let peak = 0;
    let maxDD = 0;
    const daily = new Map<string, number>();
    for (const t of trades) {
      daily.set(t.trade_date, (daily.get(t.trade_date) ?? 0) + Number(t.pnl ?? 0));
    }
    const sortedDates = Array.from(daily.keys()).sort();
    const equityCurve: EquityPoint[] = sortedDates.map((d) => {
      const dayPnl = daily.get(d)!;
      equity += dayPnl;
      peak = Math.max(peak, equity);
      maxDD = Math.max(maxDD, peak - equity);
      return { date: d, equity, pnl: dayPnl };
    });

    const bucket = (keyFn: (t: (typeof trades)[number]) => string | null | undefined) => {
      const m = new Map<string, BreakdownRow>();
      for (const t of trades) {
        const k = keyFn(t) || "unknown";
        const row = m.get(k) ?? { key: k, trades: 0, wins: 0, losses: 0, pnl: 0, winRate: 0 };
        row.trades++;
        if (t.result === "win") row.wins++;
        else if (t.result === "loss") row.losses++;
        row.pnl += Number(t.pnl ?? 0);
        m.set(k, row);
      }
      return Array.from(m.values())
        .map((r) => ({ ...r, winRate: r.wins + r.losses > 0 ? (r.wins / (r.wins + r.losses)) * 100 : 0 }))
        .sort((a, b) => b.pnl - a.pnl);
    };

    const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return {
      range: days,
      totals: {
        trades: trades.length, wins, losses, breakeven, winRate, netPnl,
        grossWin, grossLoss,
        profitFactor: Number.isFinite(profitFactor) ? profitFactor : 0,
        avgWin, avgLoss, expectancy, avgR, ruleViolations,
        maxDrawdown: maxDD, bestTrade: best, worstTrade: worst,
        longestWinStreak: longestWin, longestLossStreak: longestLoss,
      },
      equityCurve,
      bySession: bucket((t) => t.session),
      bySetup: bucket((t) => t.setup_type),
      byPair: bucket((t) => t.pair),
      byDayOfWeek: bucket((t) => DAYS[new Date(t.trade_date + "T00:00:00Z").getUTCDay()]),
    };
  });
