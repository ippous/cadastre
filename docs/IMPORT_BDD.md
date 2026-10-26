# Import départemental vers Supabase/PostGIS

## Architecture
Service Python exécuté sur le VPS Hostinger. Source : Etalab Cadastre GeoJSON (fichier .json.gz). Stockage dans une base Supabase **distincte** du projet Breeders.

## État
Code versionné, **pas encore exécuté en base**. L'application React reste pour l'instant en mode localStorage; une future API sécurisée affichera les parcelles depuis la base.

## Initialisation
Créer un projet Supabase dédié. Sur cette **nouvelle base seulement**, exécuter `supabase/cadastre_schema.sql`. Ne pas lancer `0001_initial.sql` (ancienne esquisse). PostGIS en schéma `extensions`, index GiST, RLS active et accès `anon`/`authenticated` révoqué.

## Import Yonne
```sh
python3 -m venv .venv
. .venv/bin/activate
pip install -r imports/requirements.txt
export DATABASE_URL='postgresql://...'
python imports/import_department.py --department 89 --vintage 2026-09-01
```
Alternative : `--file /chemin/cadastre-89-parcelles.json.gz`. Les secrets ne doivent jamais être placés dans le dépôt ou les variables frontend VITE_*.

## Vérification
```sql
select status,processed,error from public.cadastre_imports order by started_at desc limit 10;
select count(*) from public.cadastre_parcels where department='89';
select cadastre_id,extensions.ST_Area(geom::extensions.geography)/10000 as ha
from public.cadastre_parcels where department='89' limit 10;
```

## Limites
Script initial : traitement en lots de 500, mémoire limitée pour le JSON, upsert relançable, suivi en base. Pas encore de traitement des parcelles supprimées d'un millésime, validation de topologie exhaustive, API cartographique ou reprise partielle. Tester d'abord sur un petit extrait.
