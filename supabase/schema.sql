create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.processing_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
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
  user_id uuid not null references auth.users(id) on delete cascade,
  tool_slug text not null,
  created_at timestamptz not null default now(),
  unique (user_id, tool_slug)
);

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  status text not null default 'inactive' check (status in ('inactive', 'active', 'past_due', 'cancelled')),
  provider_customer_id text unique,
  provider_subscription_id text unique,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.processing_history enable row level security;
alter table public.favorite_tools enable row level security;
alter table public.subscriptions enable row level security;

create policy "Profiles are private to their owner"
  on public.profiles for select using (auth.uid() = id);
create policy "Owners can update their profile"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "Owners can read their history"
  on public.processing_history for select using (auth.uid() = user_id);
create policy "Owners can create their history"
  on public.processing_history for insert with check (auth.uid() = user_id);

create policy "Owners can manage their favorites"
  on public.favorite_tools for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Owners can read their subscription"
  on public.subscriptions for select using (auth.uid() = user_id);

create or replace function public.create_pdfora_profile()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''))
  on conflict (id) do nothing;
  insert into public.subscriptions (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_pdfora_user_created on auth.users;
create trigger on_pdfora_user_created
  after insert on auth.users
  for each row execute procedure public.create_pdfora_profile();
