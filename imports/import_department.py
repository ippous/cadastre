"""Import Etalab cadastral GeoJSON.gz by batches into PostGIS (server only)."""
import argparse, gzip, json, os, tempfile
from pathlib import Path
import ijson, psycopg, requests

def run(dept,vintage,path=None):
    dsn=os.environ['DATABASE_URL']
    url=f'https://cadastre.data.gouv.fr/data/etalab-cadastre/{vintage}/geojson/departements/{dept}/cadastre-{dept}-parcelles.json.gz'
    with psycopg.connect(dsn) as db:
        with db.cursor() as cur:
            cur.execute("insert into public.cadastre_imports(department,source_url,vintage,status) values(%s,%s,%s,'running') returning id",(dept,str(path or url),vintage))
            job=cur.fetchone()[0]
        db.commit()
        count=0
        try:
            with tempfile.TemporaryDirectory() as tmp:
                target=Path(path) if path else Path(tmp)/'source.json.gz'
                if not path:
                    with requests.get(url,stream=True,timeout=(15,120)) as response:
                        response.raise_for_status()
                        with target.open('wb') as out:
                            for chunk in response.iter_content(1024*1024):
                                if chunk: out.write(chunk)
                opener=gzip.open if target.suffix=='.gz' else open
                with opener(target,'rb') as stream:
                    rows=[]
                    for feature in ijson.items(stream,'features.item'):
                        g=feature.get('geometry') or {}
                        if g.get('type') not in ('Polygon','MultiPolygon'): continue
                        props=feature.get('properties') or {}
                        ident=str(props.get('id') or props.get('idu') or feature.get('id') or '')
                        commune=str(props.get('code_insee') or props.get('commune') or '')
                        section=str(props.get('section') or '')
                        number=str(props.get('numero') or '')
                        if not ident: ident=f'{commune}-{section}-{number}' if all((commune,section,number)) else ''
                        if not ident: raise ValueError('Parcel missing cadastral identifier')
                        ident=ident if ident.startswith(dept) else f'{dept}:{ident}'
                        rows.append((ident,dept,commune,section,number,vintage,json.dumps(props),json.dumps(g)))
                        if len(rows)>=500:
                            upsert(db,rows,job,count+len(rows));count+=len(rows);rows.clear()
                    if rows: upsert(db,rows,job,count+len(rows));count+=len(rows)
            with db.cursor() as cur:cur.execute("update public.cadastre_imports set status='completed',finished_at=now() where id=%s",(job,))
            db.commit()
            print('Imported',count,'parcels; job',job)
        except Exception as e:
            db.rollback()
            with db.cursor() as cur:
                cur.execute("update public.cadastre_imports set status='failed',processed=%s,error=%s,finished_at=now() where id=%s",(count,str(e)[:2000],job))
            db.commit()
            raise

def upsert(db,rows,job,total):
    query="""insert into public.cadastre_parcels(cadastre_id,department,commune,section,number,vintage,properties,geom)
    values(%s,%s,%s,%s,%s,%s,%s::jsonb,
      extensions.ST_Multi(extensions.ST_SetSRID(extensions.ST_GeomFromGeoJSON(%s),4326)))
    on conflict(cadastre_id) do update set
      department=excluded.department,commune=excluded.commune,section=excluded.section,
      number=excluded.number,vintage=excluded.vintage,properties=excluded.properties,
      geom=excluded.geom,imported_at=now()"""
    with db.cursor() as cur:
        cur.executemany(query,rows)
        cur.execute('update public.cadastre_imports set processed=%s where id=%s',(total,job))
    db.commit()

if __name__=='__main__':
    p=argparse.ArgumentParser()
    p.add_argument('--department',required=True)
    p.add_argument('--vintage',default='2026-09-01')
    p.add_argument('--file',type=Path)
    a=p.parse_args()
    if len(a.department)!=2 or not a.department.isdigit():p.error('Department must have two digits, e.g. 89')
    if a.file and not a.file.is_file():p.error('File not found')
    run(a.department,a.vintage,a.file)
