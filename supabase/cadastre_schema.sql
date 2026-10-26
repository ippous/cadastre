-- Apply ONLY to a new dedicated Supabase project. Never run on Breeders.
create schema if not exists extensions;
create extension if not exists postgis with schema extensions;
create table if not exists public.cadastre_imports(
 id uuid primary key default gen_random_uuid(), department char(2) not null,
 source_url text not null, vintage text not null,
 status text not null default 'pending' check(status in ('pending','running','completed','failed')),
 processed bigint not null default 0, error text,
 started_at timestamptz not null default now(), finished_at timestamptz
);
create table if not exists public.cadastre_parcels(
 cadastre_id text primary key, department char(2) not null, commune text,
 section text, number text, vintage text not null,
 properties jsonb not null default '{}'::jsonb,
 geom extensions.geometry(MultiPolygon,4326) not null,
 imported_at timestamptz not null default now()
);
create index if not exists cadastre_parcels_geom_idx on public.cadastre_parcels using gist(geom);
create index if not exists cadastre_parcels_dept_idx on public.cadastre_parcels(department,commune,section);
alter table public.cadastre_imports enable row level security;
alter table public.cadastre_parcels enable row level security;
revoke all on public.cadastre_imports,public.cadastre_parcels from anon,authenticated;
