# Import cadastral

Sources : https://cadastre.data.gouv.fr/datasets/plan-cadastral-informatise et https://cadastre.data.gouv.fr/datasets/cadastre-etalab

Le PCI est distribué notamment en EDIGÉO et DXF ; Cadastre Etalab fournit une extraction plus simple à exploiter en GeoJSON. Import initial : GeoJSON manuel, WGS84. Cible serveur : sélection d'un département, téléchargement, validation, transformation avec GDAL/OGR, insertion transactionnelle PostGIS, journalisation, index GIST, version/millésime, mise à jour sans doublons. Ne jamais transmettre une archive départementale entière au navigateur.
