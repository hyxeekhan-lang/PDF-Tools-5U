create table if not exists public.processing_history (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default auth.user_id(),
  operation text not null,
  input_count integer not null check (input_count >= 0),
  output_count integer not null check (output_count >= 0),
  output_bytes bigint not null check (output_bytes >= 0),
  created_at timestamptz not null default now()
);

create index if not exists processing_history_user_created_idx
  on public.processing_history (user_id, created_at desc);

create table if not exists public.favorite_tools (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default auth.user_id(),
  tool_slug text not null,
  created_at timestamptz not null default now(),
  unique (user_id, tool_slug)
);

create table if not exists public.subscriptions (
  user_id text primary key default auth.user_id(),
  plan text not null default 'free' check (plan in ('free', 'pro')),
  status text not null default 'inactive' check (status in ('inactive', 'active', 'past_due', 'cancelled')),
  provider_customer_id text unique,
  provider_subscription_id text unique,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.processing_history enable row level security;
alter table public.favorite_tools enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists "Owners can read their history" on public.processing_history;
create policy "Owners can read their history"
  on public.processing_history for select using (auth.user_id() = user_id);
drop policy if exists "Owners can create their history" on public.processing_history;
create policy "Owners can create their history"
  on public.processing_history for insert with check (auth.user_id() = user_id);

drop policy if exists "Owners can manage their favorites" on public.favorite_tools;
create policy "Owners can manage their favorites"
  on public.favorite_tools for all using (auth.user_id() = user_id) with check (auth.user_id() = user_id);

drop policy if exists "Owners can read their subscription" on public.subscriptions;
create policy "Owners can read their subscription"
  on public.subscriptions for select using (auth.user_id() = user_id);

grant usage on schema public to authenticated;
grant select, insert on public.processing_history to authenticated;
grant select, insert, delete on public.favorite_tools to authenticated;
grant select on public.subscriptions to authenticated;
