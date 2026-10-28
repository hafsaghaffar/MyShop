-- Supabase > SQL Editor mein poora run karein

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  role text not null default 'user'
);

create function handle_new_user() returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email) values (new.id, new.email);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

create function is_admin() returns boolean language sql security definer as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin')
$$;

create table products (
  id bigint generated always as identity primary key,
  title text not null,
  description text,
  price numeric not null,
  stock int not null default 0,
  image_url text,
  created_at timestamptz default now()
);

create table orders (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users,
  items jsonb not null,
  total numeric not null,
  address text not null,
  phone text not null,
  status text not null default 'pending',
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table products enable row level security;
alter table orders enable row level security;

create policy "profile read" on profiles for select using (id = auth.uid() or is_admin());

create policy "products read" on products for select using (true);
create policy "products insert" on products for insert with check (is_admin());
create policy "products update" on products for update using (is_admin());
create policy "products delete" on products for delete using (is_admin());

create policy "orders insert" on orders for insert with check (user_id = auth.uid());
create policy "orders read" on orders for select using (user_id = auth.uid() or is_admin());
create policy "orders update" on orders for update using (is_admin());

-- Pehla account signup karne ke baad usay admin banayein:
-- update profiles set role = 'admin' where email = 'your@email.com';
