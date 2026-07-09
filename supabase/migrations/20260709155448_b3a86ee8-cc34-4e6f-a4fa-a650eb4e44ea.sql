create extension if not exists "uuid-ossp";

create table trading_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  account_type text not null,
  starting_balance numeric,
  current_balance numeric,
  max_daily_loss_percent numeric,
  max_total_loss_percent numeric,
  profit_target_percent numeric,
  status text default 'active',
  phase text,
  created_at timestamptz default now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.trading_accounts TO authenticated;
GRANT ALL ON public.trading_accounts TO service_role;
ALTER TABLE public.trading_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_all" ON public.trading_accounts FOR ALL USING (auth.uid() = user_id);

create table trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  account_id uuid references trading_accounts,
  created_at timestamptz default now(),
  pair text not null,
  direction text not null,
  session text,
  setup_type text,
  entry_price numeric,
  exit_price numeric,
  stop_loss numeric,
  take_profit numeric,
  lot_size numeric,
  risk_percent numeric,
  result text,
  pnl numeric,
  r_multiple numeric,
  partial_close_taken boolean default false,
  partial_close_price numeric,
  rule_violation boolean default false,
  rule_violation_note text,
  notes text,
  screenshot_path text,
  trade_date date not null
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.trades TO authenticated;
GRANT ALL ON public.trades TO service_role;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_all" ON public.trades FOR ALL USING (auth.uid() = user_id);

create table income_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  created_at timestamptz default now(),
  source text not null,
  amount numeric not null,
  entry_date date not null,
  allocated_to_debt numeric default 0,
  allocated_to_reinvestment numeric default 0,
  notes text
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.income_entries TO authenticated;
GRANT ALL ON public.income_entries TO service_role;
ALTER TABLE public.income_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_all" ON public.income_entries FOR ALL USING (auth.uid() = user_id);

create table debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  created_at timestamptz default now(),
  creditor_name text not null,
  total_owed numeric not null,
  amount_repaid numeric default 0,
  priority integer default 0,
  notes text
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.debts TO authenticated;
GRANT ALL ON public.debts TO service_role;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_all" ON public.debts FOR ALL USING (auth.uid() = user_id);

create table debt_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  debt_id uuid references debts not null,
  source_income_id uuid references income_entries,
  amount numeric not null,
  payment_date date not null,
  notes text
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.debt_payments TO authenticated;
GRANT ALL ON public.debt_payments TO service_role;
ALTER TABLE public.debt_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_all" ON public.debt_payments FOR ALL USING (auth.uid() = user_id);

create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  created_at timestamptz default now(),
  title text not null,
  category text,
  target_value numeric,
  current_value numeric default 0,
  target_date date,
  status text default 'active'
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.goals TO authenticated;
GRANT ALL ON public.goals TO service_role;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_all" ON public.goals FOR ALL USING (auth.uid() = user_id);

create table journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  created_at timestamptz default now(),
  entry_date date not null,
  mood text,
  content text not null,
  linked_trade_id uuid references trades
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.journal_entries TO authenticated;
GRANT ALL ON public.journal_entries TO service_role;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_all" ON public.journal_entries FOR ALL USING (auth.uid() = user_id);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  created_at timestamptz default now(),
  type text not null,
  title text not null,
  body text,
  is_read boolean default false,
  action_url text,
  due_date timestamptz
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_all" ON public.notifications FOR ALL USING (auth.uid() = user_id);

create table coach_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  created_at timestamptz default now(),
  role text not null,
  content text not null
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.coach_messages TO authenticated;
GRANT ALL ON public.coach_messages TO service_role;
ALTER TABLE public.coach_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_all" ON public.coach_messages FOR ALL USING (auth.uid() = user_id);