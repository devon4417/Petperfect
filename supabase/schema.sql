-- PetPerfect schema — run in the Supabase SQL editor (sandbox first).
-- Safe to re-run: uses IF NOT EXISTS and upserts on slug.

create extension if not exists "pgcrypto";

-- Products ----------------------------------------------------------------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null,
  price_cents int not null,
  compare_at_cents int,
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Suppliers (wholesale sources per product; priority 1 = cheapest preferred)
create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  name text not null,
  unit_cost_cents int not null,
  shipping_cost_cents int not null default 0,
  shipping_days int not null default 7,
  us_warehouse boolean not null default true,
  in_stock boolean not null default true,
  priority int not null default 1,
  created_at timestamptz not null default now()
);

-- Orders (charge-on-shipment: authorized at checkout, captured when shipped)
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique not null,
  stripe_payment_intent_id text,
  customer_email text,
  customer_name text,
  shipping_address jsonb,
  line_items jsonb not null default '[]'::jsonb,
  amount_cents int not null,
  status text not null default 'pending'
    check (status in ('pending','authorized','captured','canceled','expired')),
  supplier_id uuid references suppliers(id),
  supplier_order_id text,
  tracking_number text,
  profit_cents int,
  created_at timestamptz not null default now()
);

-- Indexes -----------------------------------------------------------------
create index if not exists idx_suppliers_product on suppliers(product_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_pi on orders(stripe_payment_intent_id);

-- Seed products ------------------------------------------------------------
insert into products (slug, name, description, price_cents, compare_at_cents, active) values
  ('grooming-gloves',
   'Silicone Deshedding Grooming Gloves (Pair)',
   'Gently remove loose fur while you pet — soft silicone tips lift shedding hair without scratching. Great for shedding season, works on dogs and cats, and the collected fur peels right off for easy cleanup.',
   999, 1499, true),
  ('led-safety-collar',
   'USB-Rechargeable LED Safety Collar',
   'Keep your dog visible on dark walks. Bright LED with 3 light modes (steady, fast flash, slow flash), USB rechargeable — no batteries to replace. Cut-to-fit design adjusts from 12" to 22".',
   1199, 1799, true),
  ('travel-bowls-2pack',
   'Collapsible Silicone Travel Bowls (2-Pack)',
   'Food and water on the go. These food-grade silicone bowls pop open for mealtime and collapse flat for your bag or glovebox. Includes carabiner clips — one for food, one for water.',
   999, 1449, true),
  ('cat-teaser-wand-2pack',
   'Feather Cat Teaser Wand (2-Pack)',
   'Interactive play your cat can''t resist — natural feathers plus a bell on a flexible wand. Two wands per pack so there''s always a backup when one gets loved to pieces.',
   1199, 1649, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  price_cents = excluded.price_cents,
  compare_at_cents = excluded.compare_at_cents,
  active = excluded.active;

-- Seed one US-warehouse supplier per product (landed = unit + $4.00 shipping)
with p as (select id, slug from products)
insert into suppliers (product_id, name, unit_cost_cents, shipping_cost_cents, shipping_days, us_warehouse, in_stock, priority)
select p.id, 'CJ Dropshipping (US warehouse)',
  case p.slug
    when 'grooming-gloves'    then 38    -- landed $4.38
    when 'led-safety-collar'  then 89    -- landed $4.89
    when 'travel-bowls-2pack' then 160   -- landed $5.60
    when 'cat-teaser-wand-2pack' then 360 -- landed $7.60
  end,
  400, 5, true, true, 1
from p
on conflict do nothing;

-- Row Level Security: keep it simple for MVP.
-- Storefront reads products/suppliers with the anon key; all order writes
-- go through the service-role key in API routes (never from the browser).
alter table products enable row level security;
alter table suppliers enable row level security;
alter table orders enable row level security;

drop policy if exists "public read products" on products;
create policy "public read products" on products
  for select using (active = true);

drop policy if exists "public read suppliers" on suppliers;
create policy "public read suppliers" on suppliers
  for select using (true);
