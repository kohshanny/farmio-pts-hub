-- ============================================================================
-- FARMIO PTS HUB — Database Schema
-- Run this entire file once in the Supabase SQL Editor (SQL Editor > New Query)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PROFILES (extends Supabase auth.users with role + link to agent record)
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('agent', 'internal')),
  agent_id uuid,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. AGENTS (the rep roster)
-- ----------------------------------------------------------------------------
create table public.agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone_number text,
  status text not null default 'Active' check (status in ('Active', 'Inactive')),
  start_date date,
  notes text,
  monthly_lead_target numeric default 0,
  monthly_conversion_target numeric default 0,
  monthly_revenue_target_retailer numeric default 0,
  monthly_revenue_target_fnb numeric default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- now that agents exists, link profiles.agent_id properly (was forward-referenced above)
alter table public.profiles
  add constraint profiles_agent_id_fkey
  foreign key (agent_id) references public.agents(id) on delete set null;

-- ----------------------------------------------------------------------------
-- 3. CUSTOMERS (customer bank)
-- ----------------------------------------------------------------------------
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_contact_number text,
  assigned_agent_id uuid references public.agents(id) on delete set null,
  business_type text check (business_type in ('F&B', 'Hawker', 'Minimart', 'Catering', 'Childcare', 'Other')),
  relationship_status text default 'Active' check (relationship_status in ('Active', 'Lost', 'Won')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 4. CONFIG (global assumptions — single row table)
-- ----------------------------------------------------------------------------
create table public.config (
  id int primary key default 1,
  ltv_multiplier_fnb numeric not null default 3.79,
  ltv_multiplier_retailer numeric not null default 3.66,
  target_conversion_rate numeric not null default 0.15,
  aov_target_retailer numeric not null default 352,
  aov_target_fnb numeric not null default 114,
  orders_per_month_target_retailer numeric not null default 11,
  orders_per_month_target_fnb numeric not null default 9,
  default_commission_standard numeric not null default 35,
  default_commission_retailer numeric not null default 50,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

insert into public.config (id) values (1);

-- ----------------------------------------------------------------------------
-- 5. ORDERS (the core transaction log)
-- ----------------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_date date not null,
  agent_id uuid not null references public.agents(id) on delete restrict,
  customer_id uuid not null references public.customers(id) on delete restrict,
  payment_method text check (payment_method in ('Credit', 'PayNow', 'COD')),
  revenue_sgd numeric not null check (revenue_sgd >= 0),
  products text,
  order_type text not null default 'New' check (order_type in ('New', 'Recurring')),
  cac_sgd numeric not null default 0 check (cac_sgd >= 0),
  order_status text not null default 'Paid' check (order_status in ('Paid', 'Pending', 'Cancelled')),
  commission_amount numeric not null default 0 check (commission_amount >= 0),
  commission_status text not null default 'Pending' check (commission_status in ('Pending', 'Paid')),
  commission_paid_date date,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_agent_id_idx on public.orders(agent_id);
create index orders_customer_id_idx on public.orders(customer_id);
create index orders_order_date_idx on public.orders(order_date);
create index orders_commission_status_idx on public.orders(commission_status);

-- ----------------------------------------------------------------------------
-- HELPER FUNCTION: get current user's role + agent_id without recursive RLS
-- ----------------------------------------------------------------------------
create or replace function public.current_role_is_internal()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'internal'
  );
$$;

create or replace function public.current_agent_id()
returns uuid
language sql
security definer
stable
as $$
  select agent_id from public.profiles where id = auth.uid();
$$;

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.agents enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.config enable row level security;

-- PROFILES: users can see their own profile; internal can see all
create policy "profiles_select_own_or_internal" on public.profiles
  for select using (id = auth.uid() or public.current_role_is_internal());

-- AGENTS: internal sees all; agent sees only their own row
create policy "agents_select" on public.agents
  for select using (
    public.current_role_is_internal() or id = public.current_agent_id()
  );
create policy "agents_insert_internal_only" on public.agents
  for insert with check (public.current_role_is_internal());
create policy "agents_update_internal_only" on public.agents
  for update using (public.current_role_is_internal());
create policy "agents_delete_internal_only" on public.agents
  for delete using (public.current_role_is_internal());

-- CUSTOMERS: internal sees all; agent sees only customers assigned to them
create policy "customers_select" on public.customers
  for select using (
    public.current_role_is_internal() or assigned_agent_id = public.current_agent_id()
  );
create policy "customers_insert_internal_only" on public.customers
  for insert with check (public.current_role_is_internal());
create policy "customers_update_internal_only" on public.customers
  for update using (public.current_role_is_internal());
create policy "customers_delete_internal_only" on public.customers
  for delete using (public.current_role_is_internal());

-- ORDERS: internal sees/edits all; agent sees ONLY their own orders, read-only
create policy "orders_select" on public.orders
  for select using (
    public.current_role_is_internal() or agent_id = public.current_agent_id()
  );
create policy "orders_insert_internal_only" on public.orders
  for insert with check (public.current_role_is_internal());
create policy "orders_update_internal_only" on public.orders
  for update using (public.current_role_is_internal());
create policy "orders_delete_internal_only" on public.orders
  for delete using (public.current_role_is_internal());

-- CONFIG: internal sees/edits; agents can read (so dashboard math is consistent) but not write
create policy "config_select" on public.config
  for select using (true);
create policy "config_update_internal_only" on public.config
  for update using (public.current_role_is_internal());

-- ----------------------------------------------------------------------------
-- AUTO-CREATE PROFILE ON SIGNUP (trigger)
-- New users default to 'agent' role with no agent_id link.
-- An internal team member must promote them to 'internal' or link agent_id
-- via the Supabase Table Editor (see SETUP.md).
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'agent');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- updated_at auto-touch trigger (applied to all relevant tables)
-- ----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger agents_touch_updated_at before update on public.agents
  for each row execute function public.touch_updated_at();
create trigger customers_touch_updated_at before update on public.customers
  for each row execute function public.touch_updated_at();
create trigger orders_touch_updated_at before update on public.orders
  for each row execute function public.touch_updated_at();
