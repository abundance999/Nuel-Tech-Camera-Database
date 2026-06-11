-- Supabase database setup for admin management and client policies.
-- Run this in the Supabase SQL editor after creating the `clients` table.

create extension if not exists "uuid-ossp";

create table if not exists public.admin_users (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  created_at timestamp with time zone default now()
);

alter table public.admin_users enable row level security;

drop policy if exists "Admin select admin_users" on public.admin_users;
create policy "Admin select admin_users" on public.admin_users
  for select
  using (
    auth.role() = 'authenticated'
    AND exists (
      select 1 from public.admin_users where admin_users.email = auth.jwt() ->> 'email'
    )
  );

drop policy if exists "Admin insert admin_users" on public.admin_users;
create policy "Admin insert admin_users" on public.admin_users
  for insert
  with check (
    auth.role() = 'authenticated'
    AND (
      (select count(*) from public.admin_users) = 0
      OR exists (
        select 1 from public.admin_users where admin_users.email = auth.jwt() ->> 'email'
      )
    )
  );

drop policy if exists "Admin delete admin_users" on public.admin_users;
create policy "Admin delete admin_users" on public.admin_users
  for delete
  using (
    auth.role() = 'authenticated'
    AND exists (
      select 1 from public.admin_users where admin_users.email = auth.jwt() ->> 'email'
    )
  );

alter table public.clients enable row level security;

drop policy if exists "Public select clients" on public.clients;
create policy "Public select clients" on public.clients
  for select
  using (auth.role() = 'anon' OR auth.role() = 'authenticated');

drop policy if exists "Public insert without name/contact" on public.clients;
create policy "Public insert without name/contact" on public.clients
  for insert
  with check (
    auth.role() = 'anon'
    AND coalesce(name, '') = ''
    AND coalesce(contact, '') = ''
  );

drop policy if exists "Admin insert clients" on public.clients;
create policy "Admin insert clients" on public.clients
  for insert
  with check (
    auth.role() = 'authenticated'
  );

drop policy if exists "Public update restricted fields" on public.clients;
create policy "Public update restricted fields" on public.clients
  for update
  using (
    auth.role() = 'anon'
  )
  with check (
    auth.role() = 'anon'
    AND name = (select existing.name from public.clients existing where existing.id = id)
    AND contact = (select existing.contact from public.clients existing where existing.id = id)
    AND username = (select existing.username from public.clients existing where existing.id = id)
    AND password = (select existing.password from public.clients existing where existing.id = id)
  );

drop policy if exists "Admin update clients" on public.clients;
create policy "Admin update clients" on public.clients
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Admin delete clients" on public.clients;
create policy "Admin delete clients" on public.clients
  for delete
  using (auth.role() = 'authenticated');
