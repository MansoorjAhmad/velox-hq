import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type GoalRow = {
  id: string;
  title: string;
  category: string | null;
  target_value: number | null;
  current_value: number | null;
  target_date: string | null;
  status: string | null;
  created_at: string | null;
};

export type GoalInput = {
  title: string;
  category?: string | null;
  target_value?: number | null;
  current_value?: number | null;
  target_date?: string | null;
  status?: string | null;
};

export const listGoals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<GoalRow[]> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as GoalRow[];
  });

export const createGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: GoalInput) => data)
  .handler(async ({ data, context }): Promise<GoalRow> => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("goals")
      .insert({ ...data, status: data.status ?? "active", user_id: userId })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as GoalRow;
  });

export const updateGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; patch: Partial<GoalInput> }) => data)
  .handler(async ({ data, context }): Promise<GoalRow> => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("goals")
      .update(data.patch)
      .eq("user_id", userId)
      .eq("id", data.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as GoalRow;
  });

export const deleteGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("goals").delete().eq("user_id", userId).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
