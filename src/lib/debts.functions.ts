import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type DebtRow = {
  id: string;
  creditor_name: string;
  total_owed: number;
  amount_repaid: number | null;
  priority: number | null;
  notes: string | null;
  created_at: string | null;
};

export type DebtPaymentRow = {
  id: string;
  debt_id: string;
  amount: number;
  payment_date: string;
  notes: string | null;
  source_income_id: string | null;
};

export type DebtInput = {
  creditor_name: string;
  total_owed: number;
  amount_repaid?: number | null;
  priority?: number | null;
  notes?: string | null;
};

export type DebtPaymentInput = {
  debt_id: string;
  amount: number;
  payment_date: string;
  notes?: string | null;
};

export const listDebts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DebtRow[]> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("debts")
      .select("*")
      .eq("user_id", userId)
      .order("priority", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as DebtRow[];
  });

export const listDebtPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DebtPaymentRow[]> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("debt_payments")
      .select("*")
      .eq("user_id", userId)
      .order("payment_date", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return (data ?? []) as DebtPaymentRow[];
  });

export const createDebt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: DebtInput) => data)
  .handler(async ({ data, context }): Promise<DebtRow> => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("debts")
      .insert({ ...data, user_id: userId })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as DebtRow;
  });

export const updateDebt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; patch: Partial<DebtInput> }) => data)
  .handler(async ({ data, context }): Promise<DebtRow> => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("debts")
      .update(data.patch)
      .eq("user_id", userId)
      .eq("id", data.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as DebtRow;
  });

export const deleteDebt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("debts")
      .delete()
      .eq("user_id", userId)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const recordDebtPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: DebtPaymentInput) => data)
  .handler(async ({ data, context }): Promise<DebtPaymentRow> => {
    const { supabase, userId } = context;

    // Insert payment
    const { data: payment, error: payErr } = await supabase
      .from("debt_payments")
      .insert({ ...data, user_id: userId })
      .select("*")
      .single();
    if (payErr) throw new Error(payErr.message);

    // Increment amount_repaid on the debt
    const { data: debt, error: debtErr } = await supabase
      .from("debts")
      .select("amount_repaid")
      .eq("user_id", userId)
      .eq("id", data.debt_id)
      .single();
    if (debtErr) throw new Error(debtErr.message);

    const nextRepaid = Number(debt?.amount_repaid ?? 0) + Number(data.amount);
    const { error: updErr } = await supabase
      .from("debts")
      .update({ amount_repaid: nextRepaid })
      .eq("user_id", userId)
      .eq("id", data.debt_id);
    if (updErr) throw new Error(updErr.message);

    return payment as DebtPaymentRow;
  });
