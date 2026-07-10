import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type TradeRow = {
  id: string;
  trade_date: string;
  pair: string;
  direction: "long" | "short";
  session: string | null;
  setup_type: string | null;
  entry_price: number | null;
  exit_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  lot_size: number | null;
  risk_percent: number | null;
  result: string | null;
  pnl: number | null;
  r_multiple: number | null;
  rule_violation: boolean | null;
  notes: string | null;
  screenshot_path: string | null;
  account_id: string | null;
  created_at: string | null;
};

export type TradeInput = {
  trade_date: string;
  pair: string;
  direction: "long" | "short";
  session?: string | null;
  setup_type?: string | null;
  entry_price?: number | null;
  exit_price?: number | null;
  stop_loss?: number | null;
  take_profit?: number | null;
  lot_size?: number | null;
  risk_percent?: number | null;
  result?: string | null;
  pnl?: number | null;
  r_multiple?: number | null;
  rule_violation?: boolean | null;
  notes?: string | null;
  screenshot_path?: string | null;
  account_id?: string | null;
};

export const listTrades = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<TradeRow[]> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", userId)
      .order("trade_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return (data ?? []) as TradeRow[];
  });

export const createTrade = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: TradeInput) => data)
  .handler(async ({ data, context }): Promise<TradeRow> => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("trades")
      .insert({ ...data, user_id: userId })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as TradeRow;
  });

export const deleteTrade = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("trades")
      .delete()
      .eq("user_id", userId)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
