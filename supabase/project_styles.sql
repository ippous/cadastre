-- Projet: propriétés contextuelles sans altérer le cadastre officiel
create table if not exists public.land_projects(
 id uuid primary key default gen_random_uuid(),
 name text not null,
 description text,
 created_at timestamptz not null default now()
);
create table if not exists public.land_project_parcels(
 project_id uuid not null references public.land_projects(id) on delete cascade,
 parcel_id text not null references public.cadastre_parcels(cadastre_id),
 tags text[] not null default '{}',
 fill_color text not null default '#32a66d' check(fill_color ~ '^#[0-9a-fA-F]{6}$'),
 fill_opacity real not null default 0.4 check(fill_opacity between 0 and 1),
 outline_color text not null default '#075539' check(outline_color ~ '^#[0-9a-fA-F]{6}$'),
 outline_width real not null default 2 check(outline_width between 0 and 8),
 visible boolean not null default true,
 added_at timestamptz not null default now(),
 primary key(project_id,parcel_id)
);
create index if not exists land_project_parcels_parcel_idx on public.land_project_parcels(parcel_id);
create index if not exists land_project_parcels_tags_idx on public.land_project_parcels using gin(tags);
alter table public.land_projects enable row level security;
alter table public.land_project_parcels enable row level security;
revoke all on public.land_projects,public.land_project_parcels from anon,authenticated;
-- V1 secured server-side only. Auth/user ownership policies will precede client access.
