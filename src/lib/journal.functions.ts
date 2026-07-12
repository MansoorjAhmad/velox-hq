import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type JournalRow = {
  id: string;
  entry_date: string;
  content: string;
  mood: string | null;
  linked_trade_id: string | null;
  created_at: string | null;
};

export type JournalInput = {
  entry_date: string;
  content: string;
  mood?: string | null;
  linked_trade_id?: string | null;
};

export const listJournal = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<JournalRow[]> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", userId)
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return (data ?? []) as JournalRow[];
  });

export const createJournal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: JournalInput) => data)
  .handler(async ({ data, context }): Promise<JournalRow> => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("journal_entries")
      .insert({ ...data, user_id: userId })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as JournalRow;
  });

export const updateJournal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; patch: Partial<JournalInput> }) => data)
  .handler(async ({ data, context }): Promise<JournalRow> => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("journal_entries")
      .update(data.patch)
      .eq("user_id", userId)
      .eq("id", data.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as JournalRow;
  });

export const deleteJournal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("journal_entries")
      .delete()
      .eq("user_id", userId)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
