-- Schéma préliminaire : NE PAS exposer sans RLS et politiques de sécurité.
create extension if not exists postgis;
create table if not exists public.projects(id uuid primary key default gen_random_uuid(),name text not null,created_at timestamptz not null default now());
create table if not exists public.parcels(id text primary key,department text,commune text,section text,number text,millesime text,geometry geometry(MultiPolygon,4326),area_m2 numeric);
create index if not exists parcels_geom_idx on public.parcels using gist(geometry);
create table if not exists public.project_parcels(project_id uuid references public.projects(id) on delete cascade,parcel_id text references public.parcels(id),primary key(project_id,parcel_id));
create table if not exists public.imports(id uuid primary key default gen_random_uuid(),department text not null,millesime text,status text not null default 'pending',created_at timestamptz not null default now());
