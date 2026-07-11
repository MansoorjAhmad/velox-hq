import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type IncomeRow = {
  id: string;
  entry_date: string;
  source: string;
  amount: number;
  allocated_to_debt: number | null;
  allocated_to_reinvestment: number | null;
  notes: string | null;
  created_at: string | null;
};

export type IncomeInput = {
  entry_date: string;
  source: string;
  amount: number;
  allocated_to_debt?: number | null;
  allocated_to_reinvestment?: number | null;
  notes?: string | null;
};

export const listIncome = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<IncomeRow[]> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("income_entries")
      .select("*")
      .eq("user_id", userId)
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return (data ?? []) as IncomeRow[];
  });

export const createIncome = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: IncomeInput) => data)
  .handler(async ({ data, context }): Promise<IncomeRow> => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("income_entries")
      .insert({ ...data, user_id: userId })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as IncomeRow;
  });

export const updateIncome = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; patch: Partial<IncomeInput> }) => data)
  .handler(async ({ data, context }): Promise<IncomeRow> => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("income_entries")
      .update(data.patch)
      .eq("user_id", userId)
      .eq("id", data.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as IncomeRow;
  });

export const deleteIncome = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("income_entries")
      .delete()
      .eq("user_id", userId)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
