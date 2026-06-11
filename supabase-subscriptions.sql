-- Create subscriptions table
create table subscriptions (
  id uuid default gen_random_uuid() primary key,
  client_id uuid not null references clients(id) on delete cascade,
  phone_number text,
  network text,
  system text,
  subscription_plan text not null,
  subscription_date date default now(),
  expiring_date date not null,
  amount_subscribed numeric not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table subscriptions enable row level security;

-- Admin-only policies
drop policy if exists "Admin read subscriptions" on subscriptions;
drop policy if exists "Admin insert subscriptions" on subscriptions;
drop policy if exists "Admin update subscriptions" on subscriptions;
drop policy if exists "Admin delete subscriptions" on subscriptions;

create policy "Admin read subscriptions" on subscriptions
  for select using (
    exists (
      select 1 from admin_users where admin_users.email = auth.jwt() ->> 'email'
    )
  );

create policy "Admin insert subscriptions" on subscriptions
  for insert with check (
    exists (
      select 1 from admin_users where admin_users.email = auth.jwt() ->> 'email'
    )
  );

create policy "Admin update subscriptions" on subscriptions
  for update using (
    exists (
      select 1 from admin_users where admin_users.email = auth.jwt() ->> 'email'
    )
  );

create policy "Admin delete subscriptions" on subscriptions
  for delete using (
    exists (
      select 1 from admin_users where admin_users.email = auth.jwt() ->> 'email'
    )
  );
