import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type TradingAccountRow = {
  id: string;
  name: string;
  account_type: string;
  current_balance: number | null;
  starting_balance: number | null;
  status: string | null;
  phase: string | null;
};

export const listTradingAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<TradingAccountRow[]> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("trading_accounts")
      .select("id, name, account_type, current_balance, starting_balance, status, phase")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as TradingAccountRow[];
  });

export const createTradingAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      name: string;
      account_type: string;
      starting_balance?: number | null;
      current_balance?: number | null;
      phase?: string | null;
    }) => data,
  )
  .handler(async ({ data, context }): Promise<TradingAccountRow> => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("trading_accounts")
      .insert({
        user_id: userId,
        name: data.name,
        account_type: data.account_type,
        starting_balance: data.starting_balance ?? null,
        current_balance: data.current_balance ?? data.starting_balance ?? null,
        phase: data.phase ?? null,
        status: "active",
      })
      .select("id, name, account_type, current_balance, starting_balance, status, phase")
      .single();
    if (error) throw new Error(error.message);
    return row as TradingAccountRow;
  });
